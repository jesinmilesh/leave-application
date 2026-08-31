import prisma from '../services/prisma.js';

export async function getLiveDashboard(req, res) {
  try {
    const allLeaves = await prisma.leaveRequest.findMany({
      include: {
        history: true,
        gateLog: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalLeaves = allLeaves.length;
    const pendingMentor = allLeaves.filter(l => l.status === 'PENDING_MENTOR').length;
    const pendingHod = allLeaves.filter(l => l.status === 'PENDING_HOD').length;
    const pendingWarden = allLeaves.filter(l => l.status === 'PENDING_WARDEN').length;
    const readyAtGate = allLeaves.filter(l => l.status === 'READY_FOR_GATE').length;
    const studentsOutside = allLeaves.filter(l => l.status === 'STUDENT_OUT').length;
    const returned = allLeaves.filter(l => l.status === 'RETURNED').length;
    const rejected = allLeaves.filter(l => l.status === 'REJECTED').length;

    const outsideList = allLeaves
      .filter(l => l.status === 'STUDENT_OUT')
      .map(l => ({
        leaveId: l.leaveId,
        studentName: l.studentName,
        registerNo: l.registerNo,
        department: l.department,
        outTime: l.gateLog?.exitTime ? new Date(l.gateLog.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : l.outTime,
        expectedReturn: `${l.returnDate} ${l.returnTime}`,
        parentPhone: l.parentPhone
      }));

    const deptCounts = {};
    allLeaves.forEach(l => {
      const dept = l.department || 'CSE';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const departmentChartData = Object.keys(deptCounts).map(dept => ({
      name: dept,
      value: deptCounts[dept]
    }));

    const trendMap = {};
    allLeaves.forEach(l => {
      const dateStr = new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
    });

    const monthlyTrends = Object.keys(trendMap).map(date => ({
      date,
      count: trendMap[date]
    }));

    let totalApprovalTimeMs = 0;
    let approvedCount = 0;

    allLeaves.forEach(l => {
      if (l.history && l.history.length > 1) {
        const submitted = l.history.find(h => h.action === 'SUBMITTED');
        const finalApproval = l.history.find(h => h.role === 'Warden' && h.action === 'APPROVED');
        if (submitted && finalApproval) {
          const diff = new Date(finalApproval.timestamp).getTime() - new Date(submitted.timestamp).getTime();
          if (diff > 0) {
            totalApprovalTimeMs += diff;
            approvedCount++;
          }
        }
      }
    });

    const avgApprovalMinutes = approvedCount > 0 ? Math.round((totalApprovalTimeMs / approvedCount) / (1000 * 60)) : 42;

    res.json({
      counters: {
        totalLeaves,
        pendingMentor,
        pendingHod,
        pendingWarden,
        readyAtGate,
        studentsOutside,
        returned,
        rejected,
        avgApprovalMinutes
      },
      outsideList,
      departmentChartData: departmentChartData.length ? departmentChartData : [{ name: 'CSE', value: 1 }],
      monthlyTrends: monthlyTrends.length ? monthlyTrends : [{ date: 'Today', count: totalLeaves }],
      recentLeaves: allLeaves.slice(0, 15)
    });

  } catch (error) {
    console.error('Get Live Dashboard Error:', error);
    res.status(500).json({ error: 'Internal Error', message: 'Internal error loading principal live dashboard.' });
  }
}
