import React from 'react';
import { format, parseISO } from 'date-fns';

const PrintPayroll = ({ employee, payPeriod, dailyData, weekTotals, totals }) => {
  // Default pay rates
  const DEFAULT_HOURLY_RATE = 15.00;
  const OVERTIME_MULTIPLIER = 1.5;

  // Function to format break minutes as hours:minutes
  const formatBreakDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0 min';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? 
        `${hours}h ${remainingMinutes}m` : 
        `${hours}h`;
    }
  };

  const printPayroll = () => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    
    // CSS for better printing
    const printCSS = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { display: flex; justify-content: space-between; }
        .summary { margin: 20px 0; }
        .totals { font-weight: bold; }
        .week-totals { font-weight: bold; background-color: #e6f7ff; }
        .company-info { margin-bottom: 20px; }
        .footer { margin-top: 30px; font-size: 12px; text-align: center; }
      </style>
    `;
    
    // Format dates for display
    const formattedStartDate = payPeriod.startDate ? format(parseISO(payPeriod.startDate), 'MMMM dd, yyyy') : '';
    const formattedEndDate = payPeriod.endDate ? format(parseISO(payPeriod.endDate), 'MMMM dd, yyyy') : '';
    
    // Get the employee's hourly rate
    const hourlyRate = employee && employee.hourly_rate ? parseFloat(employee.hourly_rate) : DEFAULT_HOURLY_RATE;
    const overtimeRate = hourlyRate * OVERTIME_MULTIPLIER;
    
    // Create HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payroll - ${employee?.first_name || ''} ${employee?.last_name || ''}</title>
        ${printCSS}
      </head>
      <body>
        <div class="company-info">
          <h1>MedTrans Express, Inc.</h1>
          <p>123 Main Street, City, State ZIP</p>
          <p>Phone: (123) 456-7890</p>
        </div>
        
        <div class="header">
          <div>
            <h2>Payroll Statement</h2>
            <p>Pay Period: ${formattedStartDate} - ${formattedEndDate}</p>
          </div>
          <div>
            <p><strong>Employee:</strong> ${employee?.first_name || ''} ${employee?.last_name || ''}</p>
            <p><strong>ID:</strong> ${employee?.emp_code || ''}</p>
            <p><strong>Hiring Date:</strong> ${employee?.hiringDate ? format(parseISO(employee.hiringDate), 'MMMM dd, yyyy') : ''}</p>
            <p><strong>Pay Rate:</strong> $${hourlyRate.toFixed(2)}/hr</p>
            <p><strong>Overtime Rate:</strong> $${overtimeRate.toFixed(2)}/hr</p>
          </div>
        </div>
        
        <h3>Daily Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Shift</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Hour Type</th>
              <th>Hours</th>
              <th>Rate</th>
              <th>Break Duration</th>
              <th>Pay</th>
            </tr>
          </thead>
          <tbody>
            ${dailyData.map((day, index) => {
              const isLastDayOfWeek = (index === 6) || // First week
                                    (index === 13) || // Second week
                                    (index === dailyData.length - 1); // Last day of data
              
              const weekNumber = day.weekNumber;
              const currentWeekTotals = weekTotals[`week${weekNumber + 1}`];
              
              // If no timesheets for the day
              if (day.timesheets.length === 0) {
                const emptyDayRow = `
                <tr>
                  <td>${format(parseISO(day.date), 'MM/dd/yyyy')}</td>
                  <td>${day.dayOfWeek}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>0.00</td>
                  <td>$0.00</td>
                  <td>0 min</td>
                  <td>$0.00</td>
                </tr>`;
              
                // Add weekly total row if it's the last day of the week
                if (isLastDayOfWeek && currentWeekTotals) {
                  return `
                    ${emptyDayRow}
                    <tr class="week-totals">
                      <td colspan="5">Week ${weekNumber + 1} Totals</td>
                      <td colspan="2">${currentWeekTotals.totalHours.toFixed(2)} hours</td>
                      <td colspan="3">$${currentWeekTotals.totalPay.toFixed(2)}</td>
                    </tr>`;
                }
                return emptyDayRow;
              }
              
              // Generate rows for each shift
              const shiftRows = day.timesheets.map((shift, shiftIndex) => `
                <tr ${shiftIndex > 0 ? 'style="background-color: #f9f9f9;"' : ''}>
                  ${shiftIndex === 0 ? `
                    <td rowspan="${day.timesheets.length}">
                      ${format(parseISO(day.date), 'MM/dd/yyyy')}
                    </td>
                    <td rowspan="${day.timesheets.length}">
                      ${day.dayOfWeek}
                    </td>
                  ` : ''}
                  <td>${shiftIndex + 1}</td>
                  <td>${shift.clockIn}</td>
                  <td>${shift.clockOut}</td>
                  <td>${shift.hourType.charAt(0).toUpperCase() + shift.hourType.slice(1)}</td>
                  <td>${shift.hours.toFixed(2)}</td>
                  <td>$${shift.rate.toFixed(2)}</td>
                  <td>${shift.breakMinutes ? formatBreakDuration(shift.breakMinutes) : '0 min'}</td>
                  <td>$${shift.pay.toFixed(2)}</td>
                </tr>
              `).join('');
              
              // Add weekly total row if it's the last day of the week
              if (isLastDayOfWeek && currentWeekTotals) {
                return `
                  ${shiftRows}
                  <tr class="week-totals">
                    <td colspan="5">Week ${weekNumber + 1} Totals</td>
                    <td colspan="2">${currentWeekTotals.totalHours.toFixed(2)} hours</td>
                    <td colspan="3">$${currentWeekTotals.totalPay.toFixed(2)}</td>
                  </tr>`;
              }
              
              return shiftRows;
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="totals">
              <td colspan="5">Totals</td>
              <td colspan="2">${totals.totalHours.toFixed(2)} hours</td>
              <td colspan="3">$${totals.totalPay.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="summary">
          <h3>Pay Summary</h3>
          <table>
            <tbody>
              ${Object.entries(totals.hourTypes).map(([type, data]) => `
                <tr>
                  ${type === 'incentive' ? 
                    `<th>Incentive (Bonus)</th>` : 
                    `<th>${type.charAt(0).toUpperCase() + type.slice(1)} Hours (${data.hours.toFixed(2)})</th>`
                  }
                  <td>$${data.pay.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="totals">
                <th>Net Pay</th>
                <td>$${totals.totalPay.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated document. No signature is required.</p>
          <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <button 
      className="btn btn-primary" 
      onClick={printPayroll}
    >
      <i className="fas fa-print me-1"></i> Print Payroll
    </button>
  );
};

export default PrintPayroll; 