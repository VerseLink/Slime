import { ApiQueryResponse } from "./ApiQueryResponse";

export type QueryStoreByDomainResponse = ApiQueryResponse<QueryDomainResult[]>;

type QueryDomainResult = {
    storeId: string;
    urlPart: string;
}
