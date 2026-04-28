import { useEffect, useState } from "react";

const MIN_WIDTH = 1024;
const MIN_HEIGHT = 768;

const checkIsSupported = (): boolean => {
    return window.innerWidth >= MIN_WIDTH && window.innerHeight >= MIN_HEIGHT;
};

export const useViewportSize = (): boolean => {
    const [isSupported, setIsSupported] = useState<boolean>(checkIsSupported);

    useEffect(() => {
        const handleResize = () => {
            setIsSupported(checkIsSupported());
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isSupported;
};
