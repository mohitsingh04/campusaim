import React, { useEffect, useState, useCallback } from "react";
import { API } from "../../services/API";

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";
import { onSocketReady } from "../../utils/socket";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

export default function SystemHealth() {

    const [server, setServer] = useState(null);
    const [database, setDatabase] = useState(null);
    const [api, setApi] = useState(null);
    const [disk, setDisk] = useState(null);
    const [loading, setLoading] = useState(true);

    const [socketData, setSocketData] = useState({
        labels: [],
        cpu: [],
        memory: []
    });

    const [history, setHistory] = useState({
        labels: [],
        cpu: [],
        memory: [],
        requests: []
    });

    const fetchHealth = useCallback(async () => {
        try {

            const results = await Promise.allSettled([
                API.get("/server"),
                API.get("/database"),
                API.get("/api"),
                API.get("/disk")
            ]);

            let serverData = null;
            let apiData = null;

            if (results[0].status === "fulfilled") {
                serverData = results[0].value.data;
                setServer(serverData);
            }

            if (results[1].status === "fulfilled")
                setDatabase(results[1].value.data);

            if (results[2].status === "fulfilled") {
                apiData = results[2].value.data;
                setApi(apiData);
            }

            if (results[3].status === "fulfilled")
                setDisk(results[3].value.data);

            if (serverData || apiData) {

                setHistory(prev => ({

                    labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-12),

                    cpu: [
                        ...prev.cpu,
                        serverData
                            ? parseFloat(serverData.cpu?.usage || 0)
                            : prev.cpu.at(-1) || 0
                    ].slice(-12),

                    memory: [
                        ...prev.memory,
                        serverData
                            ? parseFloat(serverData.memory.processUsed)
                            : prev.memory.at(-1) || 0
                    ].slice(-12),

                    requests: [
                        ...prev.requests,
                        apiData ? apiData.totalRequests : prev.requests.at(-1) || 0
                    ].slice(-12)

                }));

            }

        } catch (err) {
            console.error("Health fetch error", err);
        } finally {
            setLoading(false);
        }

    }, []);

    useEffect(() => {
        fetchHealth();
    }, [fetchHealth]);

    useEffect(() => {
        let socketRef;

        const handler = (data) => {
            setSocketData(prev => ({
                labels: [...prev.labels, new Date(data.timestamp).toLocaleTimeString()].slice(-12),
                cpu: [...prev.cpu, data.cpu].slice(-12),
                memory: [...prev.memory, data.memoryMB].slice(-12)
            }));
        };

        onSocketReady((socket) => {
            socketRef = socket;
            socket.on("metrics:health", handler);
        });

        return () => {
            if (socketRef) socketRef.off("metrics:health", handler);
        };
    }, []);

    if (loading)
        return <div className="p-6">Loading system health...</div>;

    const cpuChart = {
        labels: socketData.labels,
        datasets: [
            {
                label: "CPU Load",
                data: socketData.cpu,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.2)",
                tension: 0.4
            }
        ]
    };

    const memoryChart = {
        labels: socketData.labels,
        datasets: [
            {
                label: "Memory Used (MB)",
                data: socketData.memory,
                borderColor: "#10b981",
                backgroundColor: "rgba(16,185,129,0.2)",
                tension: 0.4
            }
        ]
    };

    const requestChart = {
        labels: history.labels,
        datasets: [
            {
                label: "Total API Requests",
                data: history.requests,
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245,158,11,0.2)",
                tension: 0.4
            }
        ]
    };

    const diskUsage = parseFloat(disk?.usedPercent || 0);

    return (
        <div className="p-6 space-y-8">

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">System Health</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* SERVER */}

                <div className="bg-white shadow rounded-xl p-4">
                    <h2 className="font-semibold mb-3">Server</h2>

                    {server && (
                        <div className="space-y-1 text-sm">
                            <p>Status: <span className="text-green-600">{server.status}</span></p>
                            <p>CPU Usage: {server.cpu?.usage}</p>
                            <p>Cores: {server.cpu?.cores}</p>
                            <p>Node: {server.nodeVersion}</p>
                            <p>Memory: {server.memory.processUsed}</p>
                        </div>
                    )}
                </div>

                {/* DATABASE */}

                <div className="bg-white shadow rounded-xl p-4">
                    <h2 className="font-semibold mb-3">Database</h2>

                    {database && (
                        <div className="space-y-1 text-sm">
                            <p>Status: {database.status}</p>
                            <p>Collections: {database.collections}</p>
                            <p>Documents: {database.documents}</p>
                            <p>Storage: {database.storageSize}</p>
                        </div>
                    )}
                </div>

                {/* API */}

                <div className="bg-white shadow rounded-xl p-4">
                    <h2 className="font-semibold mb-3">API</h2>

                    {api && (
                        <div className="space-y-1 text-sm">
                            <p>Total Requests: {api.totalRequests}</p>
                            <p>Total Errors: {api.totalErrors}</p>
                            <p>Avg Response: {api.avgResponseTime}</p>
                            <p>Error Rate: {api.errorRate}</p>
                        </div>
                    )}
                </div>

                {/* DISK */}

                <div className="bg-white shadow rounded-xl p-4">
                    <h2 className="font-semibold mb-3">Disk</h2>

                    {disk && (
                        <div className="space-y-2 text-sm">

                            <p>Total: {disk.total}</p>
                            <p>Free: {disk.free}</p>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Usage</span>
                                    <span>{disk.usedPercent}</span>
                                </div>

                                <div className="w-full bg-gray-200 rounded h-2">
                                    <div
                                        className={`h-2 rounded ${diskUsage > 85
                                            ? "bg-red-500"
                                            : diskUsage > 70
                                                ? "bg-yellow-400"
                                                : "bg-green-500"
                                            }`}
                                        style={{ width: `${diskUsage}%` }}
                                    />
                                </div>

                            </div>

                        </div>
                    )}
                </div>

            </div>

            {/* CHARTS */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="font-semibold mb-4">CPU Load Trend</h2>
                    <Line data={cpuChart} />
                </div>

                <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="font-semibold mb-4">Memory Usage Trend</h2>
                    <Line data={memoryChart} />
                </div>

                <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="font-semibold mb-4">API Requests Trend</h2>
                    <Line data={requestChart} />
                </div>

            </div>

        </div>
    );
}