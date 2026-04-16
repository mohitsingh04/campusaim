import os from "os";

export const getCpuUsage = async (interval = 100) => {
    const cpus1 = os.cpus();

    await new Promise((res) => setTimeout(res, interval));

    const cpus2 = os.cpus();

    let idleDiff = 0;
    let totalDiff = 0;

    for (let i = 0; i < cpus1.length; i++) {
        const t1 = cpus1[i].times;
        const t2 = cpus2[i].times;

        const idle = t2.idle - t1.idle;

        const total1 = Object.values(t1).reduce((a, b) => a + b, 0);
        const total2 = Object.values(t2).reduce((a, b) => a + b, 0);

        const total = total2 - total1;

        idleDiff += idle;
        totalDiff += total;
    }

    const usage = 1 - idleDiff / totalDiff;

    return (usage * 100).toFixed(2); // %
};