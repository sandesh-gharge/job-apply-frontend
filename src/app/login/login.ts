import { computed, Component, signal, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { login } from '@app/utils/store/auth/auth.actions';
import { Store } from '@ngrx/store';
import { selectAuthAutoLoginLoading, selectAuthError, selectAuthLoading, selectIsAuthenticated } from '@app/utils/store/auth/auth.selectors';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { TranslationService } from '@app/utils/services/translation/translation.service';
import { NameLogo } from "@app/name-logo/name-logo";
import { selectProfileLoading } from '@app/utils/store/profile/profile.selector';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NameLogo],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  
  private router = inject(Router);
  private store = inject(Store);
  public translate = inject(TranslationService);
  private destroy$ = new Subject<void>();

  
  error = signal('');
  loading = this.store.selectSignal(selectAuthLoading);
  profileLoading = this.store.selectSignal(selectProfileLoading);
  isBusy = computed(() => this.loading() || this.profileLoading());
  showAutoLoginMessage = computed(() => !this.loading() && this.profileLoading());
  autoLoginLoading = this.store.selectSignal(selectAuthAutoLoginLoading);

  email = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{6,}$/)
  ]);
  loginFormGroup = new FormGroup({
    email: this.email,
    password: this.password
  });
  

  onSubmit() {
    if (this.loginFormGroup.valid) {
      const email = this.email.value ?? '';
      const password = this.password.value ?? '';
      this.store.dispatch(login({ email, password }));
    }
  }

  ngOnInit(): void {
    this.store.select(selectIsAuthenticated)
      .pipe(
        distinctUntilChanged(),
        filter(isAuth => isAuth === true),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.router.navigate(['/home']));

    this.store.select(selectAuthError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error.set(error || ''));
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
