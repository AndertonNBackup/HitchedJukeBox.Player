import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService, Credentials } from '../authentication/authentication.service';
import * as amqp from 'amqplib/callback_api'

@Injectable()
export class RabbitService {
    private host: string = process.env.API_URL || 'amqp://rabbitmq';
    private channel: amqp.Channel;
    private authentication: AuthenticationService;

    private static readonly RS_BASE: string = "HBJBV.Rabbit.";
    private static readonly RS_VOTER_Q: string = "Voter2Server";

    constructor(authentication: AuthenticationService) {
        this.authentication = authentication;
        this.openChannels();
    }

    private openChannels() {
        amqp.connect(this.host, function (err, conn) {
            conn.createChannel(function (err, ch) {
                this.channel = ch;
                this.channel.assertQueue(
                    RabbitService.RS_BASE + RabbitService.RS_VOTER_Q, 
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
            RabbitService.RS_BASE + RabbitService.RS_VOTER_Q, 
            new Buffer(serialisedMessage)
        );
    }

    public getMessages(): Observable<any> {
        if(!this.channel) {
            this.openChannels();
        }
        let observable = new Observable(observer => {
            
            this.channel.consume(
                RabbitService.RS_BASE + RabbitService.RS_VOTER_Q,
                msg => {
                    observer.next(msg);
                },
                {
                    noAck: true
                }
            );

            return () => {
            };
        })
        return observable;
    }
}