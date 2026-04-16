import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { captureRefFromURL } from "../../utils/refTracker";

export default function Ref() {
    const navigate = useNavigate();

    useEffect(() => {
        captureRefFromURL();

        const params = new URLSearchParams(window.location.search);
        const course = params.get("course");

        // ✅ redirect to main form
        navigate(`/apply${course ? `?course=${course}` : ""}`, { replace: true });
    }, []);

    return null; // no UI needed
}