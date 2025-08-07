import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { OPENAI_API_KEY } from '@env';

export const exportAllAnalysisToPDF = async (items, patientName = '') => {
  try {
    const groupedByMonth = items.reduce((acc, item) => {
      const date = new Date(item.timestamp);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(item);
      return acc;
    }, {});

    const points = items.map((item, index) => {
      const x = index * 40;
      const y = 200 - ((item.inr - 1.5) / (4.0 - 1.5)) * 180;
      return `${x},${y}`;
    });

    const chartSvg = `
      <svg width="100%" height="220">
        <polyline
          fill="none"
          stroke="#007AFF"
          stroke-width="2"
          points="${points.join(' ')}"
        />
        ${points.map((p, i) => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="3" fill="#007AFF" />`).join('')}
      </svg>
    `;

    const logoAsset = Asset.fromModule(require('../assets/logo.png'));
    await logoAsset.downloadAsync();
    const logoBase64 = await FileSystem.readAsStringAsync(logoAsset.localUri || '', { encoding: FileSystem.EncodingType.Base64 });
    const logoImg = `<img src="data:image/png;base64,${logoBase64}" style="height:80px;margin-bottom:10px" />`;

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h2 { text-align: center; color: #d32f2f; }
            h3 { margin-top: 30px; color: #333; }
            .month-section { margin-top: 20px; }
            .entry { margin-bottom: 10px; }
            .chart { margin: 20px 0; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 8px; font-size: 14px; }
            th { background-color: #f0f0f0; }
            .signature { margin-top: 40px; }
            .header { text-align: center; margin-bottom: 20px; }
            .tagline { color: #c62828; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoImg}
            <h1>Winning With Warfarin</h1>
            <p class="tagline">Balance your blood. Master your meals.</p>
          </div>

          <h2>INR Analysis Report</h2>
          <h3>Patient: ${patientName || 'N/A'}</h3>

          <div class="chart">
            <h3>INR Trend Over Time</h3>
            ${chartSvg}
          </div>

          ${Object.entries(groupedByMonth).map(([month, entries]) => `
            <div class="month-section">
              <h3>${month}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>INR</th>
                    <th>Analysis Summary</th>
                  </tr>
                </thead>
                <tbody>
                  ${entries.map(item => `
                    <tr>
                      <td>${new Date(item.timestamp).toLocaleString()}</td>
                      <td>${item.inr}</td>
                      <td>${item.text.replace(/\n/g, '<br/>')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}

          <div class="signature">
            <p><strong>Doctor's Notes:</strong></p>
            <p>__________________________________________</p>
            <br/>
            <p><strong>Doctor's Signature:</strong></p>
            <p>__________________________________________</p>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export PDF.');
  }
};
