import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export abstract class AIServiceInterface {
  abstract generate(prompt: string): Observable<any>;
  abstract extractJobData(jobDescription: string): Observable<any>;
}