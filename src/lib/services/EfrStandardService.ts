/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EfrStandardService {
    /**
     * List Efr Standards
     * Liste paginée des examens EFR Standard avec filtres optionnels.
     * @param page
     * @param limit
     * @param patientNom
     * @param dateExamen
     * @param medecin
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listEfrStandardsApiV1EfrStandardListGet(
        page: number = 1,
        limit: number = 10,
        patientNom?: string,
        dateExamen?: string,
        medecin?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/efr/standard/list',
            query: {
                'page': page,
                'limit': limit,
                'patient_nom': patientNom,
                'date_examen': dateExamen,
                'medecin': medecin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Efr Standard
     * Détail complet d'un examen EFR Standard.
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getEfrStandardApiV1EfrStandardIdGet(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/efr/standard/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Efr Standard
     * Supprime un examen EFR Standard (superadmin uniquement).
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteEfrStandardApiV1EfrStandardIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/efr/standard/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
