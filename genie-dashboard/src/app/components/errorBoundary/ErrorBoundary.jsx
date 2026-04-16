import React from "react";
import { reportError } from "../../utils/errorReporter";

class ErrorBoundary extends React.Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error, info) {

        reportError({
            message: error.message,
            stack: error.stack,
            componentStack: info.componentStack
        });

        this.setState({ hasError: true });
    }

    render() {

        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-screen">
                    <h2 className="text-lg font-semibold">
                        Something went wrong
                    </h2>
                </div>
            );
        }

        return this.props.children;
    }

}

export default ErrorBoundary;