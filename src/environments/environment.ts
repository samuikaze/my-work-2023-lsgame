// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  backendUri: "http://localhost:8080/api/v1",
  ssoApiUri: "http://localhost:19510",
  fileStorageServiceUri: "https://localhost:15211/",
  secretKey: "JDJ5JDEwJE1DWDkvbC96RDdvVHljdklEMFY3OE9iLmNaRy4xYnFsSjNBZFdoVlM2aTQ4UjJXd1FhSDJt",
  reverifyToken: 600,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.