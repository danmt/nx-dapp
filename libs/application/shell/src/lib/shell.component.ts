import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NotificationsService } from '@nx-dapp/application/utils/notifications';

@Component({
  selector: 'nx-dapp-shell',
  template: `
    <nx-dapp-navigation>
      <router-outlet></router-outlet>
    </nx-dapp-navigation>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit {
  constructor(private notificationsService: NotificationsService) {}

  ngOnInit() {
    this.notificationsService.init();
  }
}
