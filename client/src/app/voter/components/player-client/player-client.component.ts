import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgStyle } from '@angular/common';

import { environment } from '../../../../environments/environment';

import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { SpotifyPlayerService } from '../../../core/spotify-player/spotify-player.service';

import { QueueManagerService } from '../../../core/queue-manager/queue-manager.service';
import { QueueManagerRequest } from '../../../core/models/shared/queue-manager/queue-manager-request';
import { QueueManagerTrackRequest } from '../../../core/models/shared/queue-manager/queue-manager-track-request';
import { QueueManagerResponse } from '../../../core/models/shared/queue-manager/queue-manager-response';

import { NowPlayingItem } from '../../../core/models/shared/now-playing/now-playing-item';

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
  private data: any;
  private devices: any = false;

  private fetchingTrack: boolean

  constructor(private queueManager: QueueManagerService, private spotifyPlayer: SpotifyPlayerService) {

  }

  ngOnInit() {

    console.log("Client Init : ");
    this.spotifyPlayer.init();
    this.spotifyPlayer.on('login', (response: any) => {
      this.spotifyPlayer.fetchDevices().then((response: any) => {
        console.log("Devices");
        this.devices = response.devices;
        console.log(this);
      });
    });
    console.log(this.spotifyPlayer);

    let npItem: NowPlayingItem;
    let responseHook: string = QueueManagerResponse.fetchQueueManagerResponseHook(QueueManagerService.appPrefix, QueueManagerService.servicePrefix);
    this.connection = this.queueManager.listen(responseHook).subscribe(itemResult => {
      console.log(itemResult);
      this.itemResult = QueueManagerResponse.FromObject(itemResult);
      clearTimeout(this.timerHandle);
      let ProgressCount: number = 0;
      npItem = NowPlayingItem.FromObject(this.itemResult.item);
      this.timerHandle = setInterval(() => {
        this.timerCurrent = ((ProgressCount + 1) / npItem.GetPlaytime()) * 100;
        ProgressCount++;
        if ((this.timerCurrent >= 100) || ProgressCount >= npItem.GetPlaytime()) {
          clearTimeout(this.timerHandle);
        }
      }, 1000);
    });

    this.spotifyPlayer.on('update', (response: any) => {
      //console.log(response);
      this.data = response;
      if (((this.data.progress_ms * 100) / this.data.item.duration_ms) >= 98.5) {
        if (!this.fetchingTrack) {
          this.fetchingTrack = true;
          // Request new song from Server
          this.requestTrack();
        }
        console.log("Song Finished!");
      } else {
        this.fetchingTrack = false;
      }
    });

  }

  requestTrack() {
    let trackRequest = new QueueManagerTrackRequest(
      this.spotifyPlayer.getAccessToken(), 
      this.spotifyPlayer.getRefreshToken()
    );
    let qmRequest = new QueueManagerRequest(
      QueueManagerRequest.QM_REQUEST_INIT, 
      trackRequest
    );
    this.queueManager.talk(qmRequest);
  }

  initiate() {
    console.log("Init!!");
    let qmRequest = new QueueManagerRequest(QueueManagerRequest.QM_REQUEST_INIT, {});
    this.queueManager.talk(qmRequest);
    this.timerCurrent = 0;
  }

  playerLogin() {
    console.log("Login");
    this.spotifyPlayer.login();
  }

  playerLogout() {
    console.log("Logout");
    this.spotifyPlayer.logout();
    this.data = null;
  }

  getActiveDeviceID(): string {
    let device: any = this.devices.find((device: any) => device.is_active === true);
    return device ? device.id : '';
  }

  setDevice(deviceID: string) {
    let result = this.spotifyPlayer.setDevice(deviceID);
  }

  playerBack() {
    let result = this.spotifyPlayer.playerBack();
  }

  playerPause() {
    let result = this.spotifyPlayer.playerPause();
  }

  playerPlay() {
    let result = this.spotifyPlayer.playerPlay();
  }

  playerForward() {
    let result = this.spotifyPlayer.playerForward();
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}