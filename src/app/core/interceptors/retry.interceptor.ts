import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environment';
import { catchError, switchMap, throwError, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {

    return next(req).pipe(

        catchError((err: HttpErrorResponse) => {

            if (err.status === 0 || err.status >= 500) {

                console.log('🔥 Backend dormido, intentando despertar...');

                fetch(`${environment.apiUrl}/public/ping`)
                    .catch(() => console.log('Wake up enviado'));

                return timer(3000).pipe(
                    switchMap(() => next(req))
                );
            }

            return throwError(() => err);
        })

    );
};