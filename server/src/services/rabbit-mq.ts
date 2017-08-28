import * as logger from 'morgan';
import * as amqp from 'amqplib/callback_api'

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export class RabbitMQService {

    private static readonly RS_BASE: string = "HBJBV.Rabbit.";
    public static readonly RS_VOTER_Q: number = 0;
    public static readonly RS_PLAYER_Q: number = 1;
    public static readonly RS_PLAYLIST_Q: number = 2;

    private host: string = process.env.RABBIT_HOST || 'amqp://rabbitmq';
    private channel: amqp.Channel;

    public static bootstrap(): RabbitMQService {
        return new RabbitMQService().bootstrap();
    }

    constructor() {
        this.config();
    }

    private bootstrap(): RabbitMQService {
        this.openChannels();
        return this;
    }

    private config(): void {

    }

    private openChannels() {
        amqp.connect(this.host, (err, conn) => {
            conn.createChannel((err, ch) => {
                this.channel = ch;
                this.assertQueue(RabbitMQService.RS_VOTER_Q);
                this.assertQueue(RabbitMQService.RS_PLAYER_Q);
                this.assertQueue(RabbitMQService.RS_PLAYLIST_Q);
            });
        });
    }

    private assertQueue(queue: number) {
        this.channel.assertQueue(
            RabbitMQService.fetchQueueName(queue), 
            { 
                durable: false 
            }
        );
    }

    public sendMessage(queue: number, message: any) {
        let serialisedMessage: string = JSON.stringify(message);
        return this.channel.sendToQueue(
            RabbitMQService.fetchQueueName(queue), 
            new Buffer(serialisedMessage)
        );
    }

    public getMessagesObervable(queue: number): Observable<any> {
        let observable = new Observable(observer => {

            amqp.connect(this.host, (err, conn) => {
                conn.createChannel((err, ch) => {
                    this.channel = ch;
                    this.assertQueue(queue);
                    this.channel.consume(
                        RabbitMQService.fetchQueueName(queue),
                        msg => {
                            observer.next(msg.content.toString());
                        },
                        {
                            noAck: true
                        }
                    );
                });
            });

            return () => {
            };
        })
        return observable;
    }

    private static fetchQueueName(queue: number): string {
        let queueName: string = "";

        switch(queue) {
            case RabbitMQService.RS_VOTER_Q :
                queueName = "Voter2Server";
                break;
            case RabbitMQService.RS_PLAYER_Q :
                queueName = "Player2Server";
                break;
            case RabbitMQService.RS_PLAYLIST_Q :
                queueName = "Server2Player";
                break;                
            default :
        }

        return RabbitMQService.RS_BASE + queueName;
    }
}