import { useCallback, useState } from "react";

export default function useOpenController(initialState) {
    const [isOpenNew, setIsOpenNew] = useState(initialState);

    const toggle = useCallback(() => {
        setIsOpenNew((state) => !state);
    }, [setIsOpenNew])

    return { isOpenNew, toggle };
}