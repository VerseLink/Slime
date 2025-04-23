import { client } from "@/lib/client";
import { StoreInformation } from "@slime/api/v1/client";
import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode } from "react";

export const SlimeContext = createContext<StoreInformation | null>(null);

export function SlimePlugin({ children }: { children: ReactNode }) {

    const { isPending, error, data } = useQuery({
        queryKey: ['slime'],
        queryFn: async () => {
            const url = new URL(window.location.href);
            const storeResponse = await client.stores.$get({
                query: {
                    domain: url.hostname,
                }
            });
            const stores = await storeResponse.json();
            const store = stores.find(x => new RegExp(x.urlPart).test(url.href));
            if (!store)
                return undefined;
            const storeData = await client.stores[":storeId"].$get({
                param: {
                    storeId: store.storeId,
                },
            });
            return await storeData.json();
        }
    });

    if (isPending || error || !data) {
        return(<></>);
    }

    return (
        <SlimeContext value={data}>
            {children}
        </SlimeContext>
    );
}