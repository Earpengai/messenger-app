import { useParams } from "next/navigation";
import { useMemo } from "react";

const useConversation = () => {
    const params = useParams();

    const conversatioinId = useMemo(() => {
        if (!params?.conversatioinId) {
            return '';
        }
        return params.conversatioinId as string;
    },[params?.conversatioinId]);

    const isOpen = useMemo(() => !!conversatioinId, [conversatioinId])

    return useMemo(() => ({
        isOpen,
        conversatioinId
    }), [isOpen, conversatioinId]);
}

export default useConversation;