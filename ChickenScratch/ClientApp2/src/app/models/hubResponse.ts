export interface HubResponse<T> {
    isSuccess: boolean;
    errorMessage: string | undefined;
    data: T;
}
