
import {
    ClipboardCheck,
    Wrench,
    FileCheck
} from "lucide-react";

import "./ServiceCards.css";

function ServiceCards({
    onServiceSelect,
    serviceData = {},
    loading
}) {

    const services = [
        {
            id: "inspection",
            name: "Inspection",
            description: "Professional solar system inspection",
            icon: ClipboardCheck
        },
        {
            id: "repair",
            name: "Repair",
            description: "Solar system repair and maintenance",
            icon: Wrench
        },
        {
            id: "amc",
            name: "AMC",
            description: "Annual maintenance contract services",
            icon: FileCheck
        }
    ];

    return (
        <div className="fixit-service-cards">

            {services.map((service) => {

                const Icon = service.icon;

                const requestCount =
                    serviceData?.[service.id]?.length || 0;

                return (
                    <button
                        key={service.id}
                        type="button"
                        className="fixit-service-card"
                        onClick={() => onServiceSelect(service.id)}
                    >

                        <div className="fixit-service-icon">
                            <Icon size={23} strokeWidth={1.9} />
                        </div>

                        <div className="fixit-service-content">

                            <h2>{service.name}</h2>

                            <p>{service.description}</p>

                        </div>

                        <div className="fixit-service-footer">

                            <span className="fixit-request-count">
                                {loading
                                    ? "Loading..."
                                    : `${requestCount} Request${
                                        requestCount !== 1 ? "s" : ""
                                    }`
                                }
                            </span>

                            <span className="fixit-service-link">
                                View Details 
                            </span>

                        </div>

                    </button>
                );
            })}

        </div>
    );
}

export default ServiceCards;
