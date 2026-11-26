import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from "recharts";

import "./ServiceChart.css";



function ServiceChart({ serviceChart }) {
    const serviceData = serviceChart?.statuses || [];
const totalRequests = serviceChart?.total || 0;
    return (

        <div className="service-chart-card">

            <div className="chart-header">

                <div>
                    <h3>Service Requests</h3>

                    <p>
                        Current request status
                    </p>
                </div>

                <div className="chart-total">
                    <span>Total Requests</span>
                <strong>{totalRequests}</strong>
                </div>

            </div>


            <div className="service-chart-content">

                <div className="service-pie">

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <PieChart>

                            <Pie
                                data={serviceData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="82%"
                                paddingAngle={3}
                                stroke="none"
                            >

                                <Cell fill="#F5A623" />
                                <Cell fill="#2E7DD1" />
                                <Cell fill="#06D6A0" />
                                <Cell fill="#B8BEC9" />

                            </Pie>


                            <Tooltip
                                contentStyle={{
                                    background: "#FFFFFF",
                                    border: "1px solid rgba(10,14,26,0.10)",
                                    borderRadius: "12px",
                                    boxShadow: "0 12px 28px rgba(10,14,26,0.12)",
                                    color: "#0A0E1A",
                                }}
                            />

                        </PieChart>

                    </ResponsiveContainer>


                    <div className="pie-center">
<strong>{totalRequests}</strong>

                        <span>Total</span>

                    </div>

                </div>


                <div className="service-legend">

                    {serviceData.map((service, index) => (

                        <div
                            className="service-legend-item"
                            key={service.name}
                        >

                            <div className="legend-label">

                                <span
                                    className={`legend-dot legend-${index}`}
                                ></span>

                                <span>
                                    {service.name}
                                </span>

                            </div>

                            <strong>
                                {service.value}
                            </strong>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );
}


export default ServiceChart;