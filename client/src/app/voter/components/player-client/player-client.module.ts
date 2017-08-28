import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { PlayerClientComponent } from './player-client.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule
  ],
  declarations: [
      PlayerClientComponent
  ],
  exports: [
    PlayerClientComponent
  ]
})
export class PlayerClientModule { }
