/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PolysomnographieService {
    /**
     * List Polysomnographies
     * Liste paginée des rapports de Polysomnographie avec filtres optionnels.
     * @param page
     * @param limit
     * @param patientNom
     * @param dateEnregistrement
     * @param severite
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listPolysomnographiesApiV1PolysomnographieListGet(
        page: number = 1,
        limit: number = 10,
        patientNom?: string,
        dateEnregistrement?: string,
        severite?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/polysomnographie/list',
            query: {
                'page': page,
                'limit': limit,
                'patient_nom': patientNom,
                'date_enregistrement': dateEnregistrement,
                'severite': severite,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Polysomnographie
     * Détail complet d'un rapport de Polysomnographie.
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPolysomnographieApiV1PolysomnographieIdGet(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/polysomnographie/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Polysomnographie
     * Supprime un rapport de Polysomnographie (superadmin uniquement).
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deletePolysomnographieApiV1PolysomnographieIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/polysomnographie/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
