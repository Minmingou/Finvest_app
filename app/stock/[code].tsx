import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCompanyFinancials, getStockDaily, getStockPrice } from '../../src/services/api';
import { CompanyFinancials } from '../../src/types/company';
import { StockDailyCandle, StockPrice } from '../../src/types/stock';

function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

function formatWon(value: number | null): string {
  if (value === null) return '데이터 없음';
  const eok = 100_000_000;
  const jo = eok * 10000;
  if (Math.abs(value) >= jo) return `${(value / jo).toFixed(1)}조원`;
  if (Math.abs(value) >= eok) return `${(value / eok).toFixed(0)}억원`;
  return `${formatNumber(value)}원`;
}

function formatMetric(value: number | null, unit: string, digits = 2): string {
  if (value === null) return '데이터 없음';
  return `${value.toFixed(digits)}${unit}`;
}

export default function StockDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const [price, setPrice] = useState<StockPrice | null>(null);
  const [daily, setDaily] = useState<StockDailyCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [financials, setFinancials] = useState<CompanyFinancials | null>(null);
  const [financialsError, setFinancialsError] = useState<string | null>(null);
  const [financialsLoading, setFinancialsLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getStockPrice(code), getStockDaily(code, 10)])
      .then(([priceData, dailyData]) => {
        if (cancelled) return;
        setPrice(priceData);
        setDaily(dailyData);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    setFinancialsLoading(true);
    setFinancialsError(null);

    getCompanyFinancials(code)
      .then((data) => {
        if (cancelled) return;
        setFinancials(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setFinancialsError(e instanceof Error ? e.message : '재무정보를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setFinancialsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !price) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error ?? '종목을 찾을 수 없습니다.'}</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/stock/search')}>
          <Text style={styles.buttonText}>검색으로 돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  const isUp = price.changeAmount > 0;
  const isDown = price.changeAmount < 0;
  const changeColor = isUp ? styles.up : isDown ? styles.down : styles.flat;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{price.name}</Text>
      <Text style={styles.code}>{price.code}</Text>

      <Text style={styles.currentPrice}>{formatNumber(price.currentPrice)}원</Text>
      <Text style={[styles.change, changeColor]}>
        {isUp ? '+' : ''}
        {formatNumber(price.changeAmount)}원 ({isUp ? '+' : ''}
        {price.changeRate.toFixed(2)}%)
      </Text>

      <View style={styles.divider} />

      <View style={styles.statGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>거래량</Text>
          <Text style={styles.statValue}>{formatNumber(price.volume)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>시가</Text>
          <Text style={styles.statValue}>{formatNumber(price.openPrice)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>고가</Text>
          <Text style={styles.statValue}>{formatNumber(price.highPrice)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>저가</Text>
          <Text style={styles.statValue}>{formatNumber(price.lowPrice)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>전일 종가</Text>
          <Text style={styles.statValue}>{formatNumber(price.prevClosePrice)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>최근 일봉</Text>
      {daily.map((candle) => (
        <View key={candle.date} style={styles.candleRow}>
          <Text style={styles.candleDate}>{candle.date}</Text>
          <Text style={styles.candleClose}>{formatNumber(candle.closePrice)}원</Text>
          <Text style={styles.candleVolume}>{formatNumber(candle.volume)}주</Text>
        </View>
      ))}

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>기업 재무정보</Text>
      {financialsLoading ? (
        <ActivityIndicator style={styles.spinner} />
      ) : financialsError ? (
        <Text style={styles.errorText}>{financialsError}</Text>
      ) : financials ? (
        <>
          {financials.reportLabel && (
            <Text style={styles.reportLabel}>{financials.reportLabel}</Text>
          )}
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>매출액</Text>
              <Text style={styles.statValue}>{formatWon(financials.revenue)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>영업이익</Text>
              <Text style={styles.statValue}>{formatWon(financials.operatingIncome)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>순이익</Text>
              <Text style={styles.statValue}>{formatWon(financials.netIncome)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>자산총계</Text>
              <Text style={styles.statValue}>{formatWon(financials.totalAssets)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>부채총계</Text>
              <Text style={styles.statValue}>{formatWon(financials.totalLiabilities)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>자본총계</Text>
              <Text style={styles.statValue}>{formatWon(financials.totalEquity)}</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, styles.metricsLabel]}>투자지표</Text>
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>EPS</Text>
              <Text style={styles.statValue}>{formatMetric(financials.eps, '원', 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ROE</Text>
              <Text style={styles.statValue}>{formatMetric(financials.roe, '%')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PER</Text>
              <Text style={styles.statValue}>{formatMetric(financials.per, '배')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PBR</Text>
              <Text style={styles.statValue}>{formatMetric(financials.pbr, '배')}</Text>
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 },
  name: { fontSize: 22, fontWeight: 'bold' },
  code: { fontSize: 13, color: '#888', marginTop: 2 },
  currentPrice: { fontSize: 32, fontWeight: 'bold', marginTop: 16 },
  change: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  up: { color: '#c62828' },
  down: { color: '#1565c0' },
  flat: { color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statItem: { width: '30%' },
  statLabel: { fontSize: 12, color: '#888' },
  statValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10 },
  metricsLabel: { marginTop: 20 },
  reportLabel: { fontSize: 12, color: '#888', marginBottom: 12 },
  spinner: { marginVertical: 10 },
  candleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  candleDate: { fontSize: 13, color: '#888', width: 90 },
  candleClose: { fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  candleVolume: { fontSize: 13, color: '#888', width: 90, textAlign: 'right' },
  errorText: { fontSize: 15, color: '#c62828', textAlign: 'center' },
  button: {
    backgroundColor: '#222',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
