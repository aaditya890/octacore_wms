import { Component } from '@angular/core';
import { RegisterComponent } from "../../../wms-auth/register/register.component";

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [RegisterComponent],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateComponent {

}
