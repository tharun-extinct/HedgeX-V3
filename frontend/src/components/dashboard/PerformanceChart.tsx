
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoricalDataPoint, Timeframe } from '../../types/finance';

interface PerformanceChartProps {
  selectedStock: string | null;
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  getHistoricalData: (symbol: string, timeframe: Timeframe) => HistoricalDataPoint[];
}

const PerformanceChart = ({
  selectedStock,
  selectedTimeframe,
  onTimeframeChange,
  getHistoricalData
}: PerformanceChartProps) => {
  const [chartData, setChartData] = useState<HistoricalDataPoint[]>([]);
  const [startValue, setStartValue] = useState<number>(0);
  
  useEffect(() => {
    if (selectedStock) {
      const data = getHistoricalData(selectedStock, selectedTimeframe);
      setChartData(data);
      
      if (data.length > 0) {
        setStartValue(data[0].close);
      }
    }
  }, [selectedStock, selectedTimeframe, getHistoricalData]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const calculateChange = () => {
    if (chartData.length < 2) return { value: 0, percentage: 0 };
    
    const startPrice = chartData[0].close;
    const endPrice = chartData[chartData.length - 1].close;
    const change = endPrice - startPrice;
    const percentage = (change / startPrice) * 100;
    
    return { value: change, percentage };
  };
  
  const { value: changeValue, percentage: changePercentage } = calculateChange();
  const changeColor = changeValue >= 0 ? 'text-finance-positive' : 'text-finance-negative';
  
  const formatDate = (date: string) => {
    const d = new Date(date);
    
    switch (selectedTimeframe) {
      case '1D':
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1W':
      case '1M':
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case '6M':
      case '1Y':
      case 'All':
        return d.toLocaleDateString([], { year: 'numeric', month: 'short' });
      default:
        return date;
    }
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded shadow-md p-2 text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-xs">Open: {formatCurrency(payload[0].payload.open)}</p>
          <p className="text-xs">Close: {formatCurrency(payload[0].payload.close)}</p>
          <p className="text-xs">High: {formatCurrency(payload[0].payload.high)}</p>
          <p className="text-xs">Low: {formatCurrency(payload[0].payload.low)}</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>{selectedStock || 'Select a stock'}</CardTitle>
            <CardDescription>
              Performance over time
            </CardDescription>
          </div>
          
          {selectedStock && (
            <div className="text-right">
              <div className="text-lg font-bold">
                {chartData.length > 0 ? formatCurrency(chartData[chartData.length - 1].close) : 'N/A'}
              </div>
              <div className={`text-sm font-medium ${changeColor}`}>
                {changeValue >= 0 ? '+' : ''}
                {formatCurrency(changeValue)} ({changePercentage >= 0 ? '+' : ''}
                {changePercentage.toFixed(2)}%)
              </div>
            </div>
          )}
        </div>
        
        <Tabs 
          value={selectedTimeframe} 
          onValueChange={(value) => onTimeframeChange(value as Timeframe)}
          className="mt-3"
        >
          <TabsList className="grid grid-cols-6 w-full max-w-md">
            <TabsTrigger value="1D">1D</TabsTrigger>
            <TabsTrigger value="1W">1W</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="6M">6M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
            <TabsTrigger value="All">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {selectedStock ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData.map(item => ({
                  ...item,
                  date: formatDate(item.date)
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                  tickMargin={10}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={startValue} stroke="#888" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={changeValue >= 0 ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a stock to view performance chart
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
