import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-lobby',
  templateUrl: './join-lobby.component.html',
  styleUrls: ['./join-lobby.component.scss']
})
export class JoinLobbyComponent implements OnInit {
  lobbyCode: string | null = null;
  form!: FormGroup;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      lobbyCode: new FormControl(null, [Validators.required, Validators.minLength(3)])
    });
  }

  get isLobbyCodeControlInvalid(): boolean {
    return this.lobbyCodeControl?.invalid && (this.lobbyCodeControl?.touched || this.lobbyCodeControl?.dirty);
  }
  get lobbyCodeControl(): FormControl {
    return this.form.get('lobbyCode') as FormControl;
  }

  get submitControl(): FormControl {
    return this.form.get('submit') as FormControl;
  }

  onSubmit(): void {
    this.form.disable(); /* Prevent double submission */
    this.lobbyCode = this.lobbyCodeControl.value;
    this.router.navigate(['/lobby', this.lobbyCode]);
  }
}
