import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import "./CustomerChart.css";

function CustomerChart({ data, thisMonth }) {
    return (
        <div className="customer-chart-card">

            <div className="chart-header">

                <div>
                    <h3>New Customers</h3>

                    <p>
                        Customer growth
                    </p>
                </div>

                <div className="chart-total">
                    <span>This Month</span>
                    <strong>{thisMonth ?? 0}</strong>
                </div>

            </div>


            <div className="customer-chart">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart
                        data={data || []}
                        margin={{
                            top: 10,
                            right: 5,
                            left: -20,
                            bottom: 0,
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(10,14,26,0.08)"
                            vertical={false}
                        />


                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#5B6478",
                                fontSize: 11,
                            }}
                        />


                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#5B6478",
                                fontSize: 11,
                            }}
                        />


                        <Tooltip
                            cursor={{
                                fill: "rgba(255,199,44,0.12)",
                            }}
                            contentStyle={{
                                background: "#FFFFFF",
                                border: "1px solid rgba(10,14,26,0.10)",
                                borderRadius: "12px",
                                boxShadow: "0 12px 28px rgba(10,14,26,0.12)",
                                color: "#0A0E1A",
                            }}
                            formatter={(value) => [
                                value,
                                "Customers",
                            ]}
                        />


                        <Bar
                            dataKey="customers"
                            fill="#F5A623"
                            radius={[5, 5, 0, 0]}
                            barSize={18}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default CustomerChart;