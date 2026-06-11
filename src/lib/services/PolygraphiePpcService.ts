/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PolygraphiePpcService {
    /**
     * List Polygraphie Ppcs
     * Liste paginée des rapports de Polygraphie sous PPC avec filtres optionnels.
     * @param page
     * @param limit
     * @param patientNom
     * @param dateEnregistrement
     * @param severiteResiduelle
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listPolygraphiePpcsApiV1PolygraphiePpcListGet(
        page: number = 1,
        limit: number = 10,
        patientNom?: string,
        dateEnregistrement?: string,
        severiteResiduelle?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/polygraphie-ppc/list',
            query: {
                'page': page,
                'limit': limit,
                'patient_nom': patientNom,
                'date_enregistrement': dateEnregistrement,
                'severite_residuelle': severiteResiduelle,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Polygraphie Ppc
     * Détail complet d'un rapport de Polygraphie sous PPC.
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPolygraphiePpcApiV1PolygraphiePpcIdGet(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/polygraphie-ppc/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Polygraphie Ppc
     * Supprime un rapport de Polygraphie sous PPC (superadmin uniquement).
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deletePolygraphiePpcApiV1PolygraphiePpcIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/polygraphie-ppc/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
