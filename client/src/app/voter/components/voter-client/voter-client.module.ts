import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MusicSearchComponent } from './music-search/music-search.component';
import { ResultsViewComponent } from './results-view/results-view.component';
import { VoterClientComponent } from './voter-client.component';
import { NowPlayingComponent } from './now-playing/now-playing.component';

import { TrackComponent } from '../../../voter/track/track.component';
import { AlbumComponent } from '../../../voter/album/album.component';
import { ArtistComponent } from '../../../voter/artist/artist.component';

import { NowPlayingItemComponent } from '../../../voter/components/voter-client/now-playing/now-playing-item/now-playing-item.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule
  ],
  declarations: [
      VoterClientComponent,
      MusicSearchComponent,
      ResultsViewComponent,
      NowPlayingComponent,
      NowPlayingItemComponent,
      TrackComponent,
      AlbumComponent,
      ArtistComponent
  ],
  exports: [
    VoterClientComponent
  ]
})
export class VoterClientModule { }
