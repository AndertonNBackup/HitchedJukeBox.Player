import * as logger from 'morgan';
import * as amqp from 'amqplib/callback_api'

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { UserFunctions } from './user';

export class RabbitMQService {

    private static readonly RS_BASE: string = "HBJBV.Rabbit.";
    private static readonly RS_VOTER_Q: string = "Voter2Server";

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
                this.channel.assertQueue(
                    RabbitMQService.RS_BASE + RabbitMQService.RS_VOTER_Q, 
                    { 
                        durable: false 
                    }
                );
            });
        });
    }

    public sendMessage(message: any) {
        let serialisedMessage: string = JSON.stringify(message);
        return this.channel.sendToQueue(
            RabbitMQService.RS_BASE + RabbitMQService.RS_VOTER_Q, 
            new Buffer(serialisedMessage)
        );
    }

    public getMessages(): Observable<any> {
        let observable = new Observable(observer => {

            amqp.connect(this.host, (err, conn) => {
                conn.createChannel((err, ch) => {
                    this.channel = ch;
                    this.channel.assertQueue(
                        RabbitMQService.RS_BASE + RabbitMQService.RS_VOTER_Q, 
                        { 
                            durable: false 
                        }
                    );
                    this.channel.consume(
                        RabbitMQService.RS_BASE + RabbitMQService.RS_VOTER_Q,
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

}