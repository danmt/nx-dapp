import { Component } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import * as arweave from '@nx-dapp//arweave//arweave-sdk';


@Component({
  selector: 'nx-dapp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  
  uploadForm = new FormGroup({
    uploadText: new FormControl('')
  })

  onSubmit = () => {
    const text = this.uploadForm.value.uploadText;

    arweave.init().then( (data) => {
      console.log(data);
    })
    
  }
}
