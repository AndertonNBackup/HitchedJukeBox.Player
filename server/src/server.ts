import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";
import * as redis from 'socket.io-redis';
import * as logger from 'morgan';
import * as querystring from 'querystring';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as request from 'request';
import * as ejs from 'ejs';

import { RabbitMQService } from './services/rabbit-mq';
import { QueueManagerService } from './services/queue-manager';

class Server {
    public static readonly REDIS_HOST = 'localhost';
    public static readonly PORT: number = 8090;
    public static readonly APP_PREFIX: string = "HJB";
    public static readonly DEV = process.env.DEV ? true : false;
    public static stateKey: string = 'spotify_auth_state';

    public static readonly client_id: string = process.env.CLIENT_ID;
    public static readonly client_secret: string = process.env.CLIENT_SECRET;
    public static readonly redirect_uri: string = Server.DEV ? 'http://localhost:' + Server.PORT + '/callback' : process.env.REDIRECT_URI;

    public app: any;
    private server: any;
    private io: SocketIO.Server;
    private rabbit: RabbitMQService;
    private queueManager: QueueManagerService;
    private redisHost: string;
    private port: number;

    public static bootstrap(): Server {
        return new Server().bootstrap();
    }

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.authServerSetup();
        this.sockets();
        this.services();
        this.listen();
    }

    private bootstrap(): Server {

        return this;
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = http.createServer(this.app);
    }

    private config(): void {
        this.port = parseInt(process.env.PORT) || Server.PORT;
        this.redisHost = process.env.REDIS_HOST || Server.REDIS_HOST;
        this.app.use(cookieParser());
        this.app.use(bodyParser.json());
    }

    private sockets(): void {
        try {
            this.io = socketIo(this.server);
            this.io.adapter(redis({ host: this.redisHost, port: 6379 }));
        }
        catch (e) {
            this.io = socketIo(this.server);
        }

    }

    private services(): void {
        this.rabbit = RabbitMQService.bootstrap();
        this.queueManager = QueueManagerService.bootstrap(this.rabbit);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: SocketIO.Socket) => {

            this.queueManager.register_hooks(this.io, socket, Server.APP_PREFIX);

            console.log('Connected client on port %s.', this.port);
            console.log('Connected client id : %s.', socket.id);

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    private authServerSetup(): void {
        this.app.use(express.static(__dirname + '/public'));

        // views is directory for all template files
        this.app.set('views', __dirname + '/views');
        this.app.set('view engine', 'ejs');

        console.log("Auth Server Running!");
        console.log("Client ID : " + Server.client_id);
        console.log("Client Secret : " + Server.client_secret);

        this.app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
            res.header("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
            next();
        });

        this.app.get('/login', function (req, res) {
            var state = Server.generateRandomString(16);
            res.cookie(Server.stateKey, state);

            // your application requests authorization
            var scope = 'user-read-playback-state user-modify-playback-state';
            res.redirect('https://accounts.spotify.com/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: Server.client_id,
                    scope: scope,
                    redirect_uri: Server.redirect_uri,
                    state: state
                }));
        });

        this.app.get('/', (req, res) => {
            res.render('pages/home', {});
        });

        this.app.get('/callback', function (req, res) {

            // your application requests refresh and access tokens
            // after checking the state parameter

            var code = req.query.code || null;
            var state = req.query.state || null;
            var storedState = req.cookies ? req.cookies[Server.stateKey] : null;

            if (state === null || state !== storedState) {
                console.log('state mismatch', 'state: ' + state, 'storedState ' + storedState, 'cookies ', req.cookies);
                res.render('pages/callback', {
                    access_token: null,
                    expires_in: null
                });
            } else {
                res.clearCookie(Server.stateKey);
                var authOptions = {
                    url: 'https://accounts.spotify.com/api/token',
                    form: {
                        code: code,
                        redirect_uri: Server.redirect_uri,
                        grant_type: 'authorization_code'
                    },
                    headers: {
                        'Authorization': 'Basic ' + (new Buffer(Server.client_id + ':' + Server.client_secret).toString('base64'))
                    },
                    json: true
                };

                request.post(authOptions, function (error, response, body) {
                    if (!error && response.statusCode === 200) {

                        var access_token = body.access_token,
                            refresh_token = body.refresh_token,
                            expires_in = body.expires_in;

                        console.log('everything is fine');
                        res.cookie('refresh_token', refresh_token, { maxAge: 30 * 24 * 3600 * 1000, domain: 'localhost' });

                        res.render('pages/callback', {
                            access_token: access_token,
                            expires_in: expires_in,
                            refresh_token: refresh_token
                        });
                    } else {
                        console.log('wrong token');

                        res.render('pages/callback', {
                            access_token: null,
                            expires_in: null
                        });
                    }
                });
            }
        });

        this.app.post('/token', function (req, res) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            var refreshToken = req.body ? req.body.refresh_token : null;
            if (refreshToken) {
                var authOptions = {
                    url: 'https://accounts.spotify.com/api/token',
                    form: {
                        refresh_token: refreshToken,
                        grant_type: 'refresh_token'
                    },
                    headers: {
                        'Authorization': 'Basic ' + (new Buffer(Server.client_id + ':' + Server.client_secret).toString('base64'))
                    },
                    json: true
                };
                request.post(authOptions, function (error, response, body) {
                    if (!error && response.statusCode === 200) {

                        var access_token = body.access_token,
                            expires_in = body.expires_in;

                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ access_token: access_token, expires_in: expires_in }));
                    } else {
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ access_token: '', expires_in: '' }));
                    }
                });
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ access_token: '', expires_in: '' }));
            }
        });

    }

    /**
     * Generates a random string containing numbers and letters
     * @param  {number} length The length of the string
     * @return {string} The generated string
     */
    public static generateRandomString(length: number): string {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

const server = Server.bootstrap();
const app = server.app;
export default app;