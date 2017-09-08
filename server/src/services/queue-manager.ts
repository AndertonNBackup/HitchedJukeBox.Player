import * as logger from 'morgan';
import * as socketIo from "socket.io";
import * as amqp from 'amqplib/callback_api'

import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { RabbitMQService } from './rabbit-mq';

import { SpotifyTrack } from '../models/shared/core/spotify-track';

import { NowPlayingItem } from '../models/shared/now-playing/now-playing-item';
import { QueueManagerRequest } from '../models/shared/queue-manager/queue-manager-request';
import { QueueManagerResponse } from '../models/shared/queue-manager/queue-manager-response';

export class QueueManagerService {
    public static readonly SERVICE_PREFIX: string = "QueueManager";

    private appPrefix: string;

    private io: SocketIO.Server;
    private rabbit: RabbitMQService;
    private serverConnection: ISubscription;

    private timerHandle: any;
    private MinTime: number = 5;
    private MaxTime: number = 15;

    public static bootstrap(rabbit: RabbitMQService): QueueManagerService {
        return new QueueManagerService(rabbit).bootstrap();
    }

    constructor(rabbit: RabbitMQService) {
        this.config();
        this.rabbit = rabbit;
    }

    private bootstrap(): QueueManagerService {
        this.listen();
        return this;
    }

    private config(): void {
        console.log('Queue Manager Service Initiated!');
    }

    private listen(): void {

        this.serverConnection = this.rabbit.getMessagesObervable(RabbitMQService.RS_PLAYLIST_Q).subscribe((track): any => {

            let playingItem: NowPlayingItem = NowPlayingItem.FromObject(JSON.parse(track));
            if(playingItem.getType() !== -1) {
                playingItem.SetPlayed(true);
                playingItem.SetPlaytime(this.randomIntFromInterval(this.MinTime, this.MaxTime));
                let queueManagerRequest = new QueueManagerRequest(QueueManagerRequest.QM_REQUEST_INIT, {});
                this.timerHandle = setTimeout(() => {
                    this.trigger_player(queueManagerRequest);
                }, 1000 * playingItem.GetPlaytime());
            }
            let response: QueueManagerResponse = new QueueManagerResponse(
                playingItem
            );

            this.io.emit(
                QueueManagerResponse.fetchQueueManagerResponseHook(this.appPrefix, QueueManagerService.SERVICE_PREFIX),
                response
            );

        });

    }

    public register_hooks(io: SocketIO.Server, socket: SocketIO.Socket, appPrefix: string): void {

        this.io = io;
        this.appPrefix = appPrefix;

        socket.on(
            QueueManagerRequest.fetchCommandHook(appPrefix, QueueManagerService.SERVICE_PREFIX),
            (queueManagerRequest: QueueManagerRequest): any => {
                queueManagerRequest = QueueManagerRequest.FromObject(queueManagerRequest);
                this.trigger_player(queueManagerRequest);
            });
    }

    private trigger_player(queueManagerRequest: QueueManagerRequest): void
    {
        this.rabbit.sendMessage(RabbitMQService.RS_PLAYER_Q, queueManagerRequest);
    }

    private randomIntFromInterval(min: number, max: number): number
    {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

}