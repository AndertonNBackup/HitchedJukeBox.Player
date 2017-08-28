import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SocketService } from '../socket/socket.service'

import { QueueManagerRequest } from '../models/shared/queue-manager/queue-manager-request';

@Injectable()
export class QueueManagerService {

    public static appPrefix: string = "HJB";
    public static servicePrefix: string = 'QueueManager';

    constructor(private socket: SocketService) {

    }

    talk(queueManagerRequest: QueueManagerRequest):void {
        let searchHook = QueueManagerRequest.fetchCommandHook(QueueManagerService.appPrefix, QueueManagerService.servicePrefix);
        this.socket.sendMessage(searchHook, queueManagerRequest);
    }

    listen(responseHook: string): Observable<any> {
        return this.socket.getMessages(responseHook);
    };

}