import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgStyle } from '@angular/common';

import { environment } from '../../../../environments/environment';

import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { QueueManagerService } from '../../../core/queue-manager/queue-manager.service';
import { QueueManagerRequest } from '../../../core/models/shared/queue-manager/queue-manager-request';
import { QueueManagerResponse } from '../../../core/models/shared/queue-manager/queue-manager-response';

@Component({
  selector: 'hjbv-player',
  templateUrl: './player-client.component.html',
  styleUrls: ['./player-client.component.scss']
})
export class PlayerClientComponent implements OnInit, OnDestroy {

  private connection: ISubscription;
  private itemResult: QueueManagerResponse;
  private timerMax: number = 10;
  private timerCurrent: number;
  private timerHandle: any;

  constructor(private queueManager: QueueManagerService) {

  }

  ngOnInit() {

    let responseHook: string = QueueManagerResponse.fetchQueueManagerResponseHook(QueueManagerService.appPrefix, QueueManagerService.servicePrefix);
    this.connection = this.queueManager.listen(responseHook).subscribe(itemResult => {
      console.log(itemResult);
      this.itemResult = QueueManagerResponse.FromObject(itemResult);
      clearTimeout(this.timerHandle);
      let ProgressCount: number = 0;
      this.timerHandle = setInterval(() => {
        this.timerCurrent = ((ProgressCount + 1) / this.timerMax) * 100;
        ProgressCount++;
        if(ProgressCount > 10) {
          clearTimeout(this.timerHandle);
        }
      }, 1000);
    });

  }

  initiate() {
    console.log("Init!!");
    let qmRequest = new QueueManagerRequest(QueueManagerRequest.QM_REQUEST_INIT, {});
    this.queueManager.talk(qmRequest);
    this.timerCurrent = 0;
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}