import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SearchBarComponent} from "../../components/search-bar/search-bar.component";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatButtonModule, SearchBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {}
