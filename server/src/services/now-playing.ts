import * as logger from 'morgan';
import * as socketIo from "socket.io";
import * as amqp from 'amqplib/callback_api'

import { UserFunctions } from './user';
import { RabbitMQService } from './rabbit-mq';

import { SpotifyTrack } from '../models/shared/core/spotify-track';

import { NowPlayingRequest } from '../models/shared/now-playing/now-playing-request';
import { NowPlayingTrackRequest } from '../models/shared/now-playing/now-playing-track-request';
import { NowPlayingAlbumRequest } from '../models/shared/now-playing/now-playing-album-request';
import { NowPlayingCommandRequest } from '../models/shared/now-playing/now-playing-command-request';
import { NowPlayingResponse } from '../models/shared/now-playing/now-playing-response';

import { NowPlayingItem } from '../models/shared/now-playing/now-playing-item';

export class NowPlayingService {
    public static readonly SERVICE_PREFIX: string = "NowPlaying";

    private appPrefix: string;

    private io: SocketIO.Server;
    private rabbit: RabbitMQService;

    private MainQueue: Array<NowPlayingItem>;

    public static bootstrap(rabbit: RabbitMQService): NowPlayingService {
        return new NowPlayingService(rabbit).bootstrap();
    }

    constructor(rabbit: RabbitMQService) {
        this.config();
        this.rabbit = rabbit;
    }

    private bootstrap(): NowPlayingService {
        return this;
    }

    private config(): void {
        console.log('Now Playing Service Initiated!');

        this.MainQueue = new Array<any>();
    }

    public register_hooks(io: SocketIO.Server, socket: SocketIO.Socket, appPrefix: string): void {

        this.io = io;
        this.appPrefix = appPrefix;
        
        socket.on(
            NowPlayingRequest.fetchCommandHook(appPrefix, NowPlayingService.SERVICE_PREFIX),
            (nowPlayingRequest: NowPlayingRequest): any => {

                let user = UserFunctions.getUser(socket.id);
                nowPlayingRequest = NowPlayingRequest.FromObject(nowPlayingRequest);
                nowPlayingRequest.AddCredentials(user);
                this.rabbit.sendMessage(nowPlayingRequest);

            });
    }

}