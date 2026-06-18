// 首页 — 11 板块宫格 + 快速指标卡片 + 预警提示 + 语言切换
import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Surface, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getDatabase, needsRegistration } from '../../src/database';
import { getUser } from '../../src/database/repositories/userRepo';
import { getLatestVitals } from '../../src/database/repositories/vitalsRepo';
import { getLatestNutrition } from '../../src/database/repositories/nutritionRepo';
import { getRiskAssessment, type RiskAssessment } from '../../src/database/repositories/exacerbationRepo';
import { getLatestCATScore } from '../../src/database/repositories/symptomRepo';
import { useT, useLanguage } from '../../src/i18n';
import { seedScreenshotData } from '../../src/database/seedData';
import { Colors, Spacing, Radius, Shadow, FontSize } from '../../src/theme/visual-tokens';
import type { User, DailyVitals, NutritionWeight } from '../../src/types/models';

interface ModuleItem {
  key: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  color: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const t = useT();
  const { lang, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [latestVitals, setLatestVitals] = useState<DailyVitals | null>(null);
  const [latestNutrition, setLatestNutrition] = useState<NutritionWeight | null>(null);
  const [exacerbationRisk, setExacerbationRisk] = useState<'low' | 'medium' | 'high'>('low');
  const [latestCAT, setLatestCAT] = useState<number | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [showAllModules, setShowAllModules] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 注册检查：无用户 → 重定向到注册页
  useEffect(() => {
    (async () => {
      try {
        const db = await getDatabase();
        const needsReg = await needsRegistration();
        if (needsReg) {
          router.replace('/register');
          return;
        }
        setIsLoading(false);
      } catch (e) {
        console.error('Auth check failed:', e);
        router.replace('/register');
      }
    })();
  }, [router]);

  // 高频使用模块（首页快速入口）
  const QUICK_MODULES: ModuleItem[] = [
    { key: 'vitals',       title: t.modules.vitals,       icon: 'heart-pulse',      route: '/record/vitals',          color: '#C62828' },
    { key: 'symptom',       title: t.modules.symptom,       icon: 'clipboard-list',   route: '/record/symptom',         color: '#6A1B9A' },
    { key: 'medication',    title: t.modules.medication,    icon: 'pill',             route: '/record/medication',      color: '#00695C' },
    { key: 'pulmonary',     title: t.modules.pulmonary,     icon: 'lungs',            route: '/record/pulmonary',  color: '#2E7D32' },
  ];

  // 全部模块（展开后显示）
  const ALL_MODULES: ModuleItem[] = [
    { key: 'pulmonary',     title: t.modules.pulmonary,     icon: 'lungs',            route: '/record/pulmonary',  color: '#2E7D32' },
    { key: 'inflammation',  title: t.modules.inflammation,  icon: 'flask',            route: '/record/inflammation',    color: '#0277BD' },
    { key: 'symptom',       title: t.modules.symptom,       icon: 'clipboard-list',   route: '/record/symptom',         color: '#6A1B9A' },
    { key: 'exercise',      title: t.modules.exercise,      icon: 'run-fast',         route: '/record/exercise',        color: '#E65100' },
    { key: 'vitals',       title: t.modules.vitals,       icon: 'heart-pulse',      route: '/record/vitals',          color: '#C62828' },
    { key: 'nutrition',     title: t.modules.nutrition,     icon: 'scale-bathroom',   route: '/record/nutrition',       color: '#F57F17' },
    { key: 'exacerbation',  title: t.modules.exacerbation,  icon: 'alert-octagon',    route: '/record/exacerbation',    color: '#B71C1C' },
    { key: 'medication',    title: t.modules.medication,    icon: 'pill',             route: '/record/medication',      color: '#00695C' },
    { key: 'comorbidity',   title: t.modules.comorbidity,   icon: 'hospital-box',     route: '/record/comorbidity',     color: '#37474F' },
    { key: 'smoking',       title: t.modules.smoking,       icon: 'smoking-off',      route: '/record/smoking',         color: '#795548' },
    { key: 'sleep',         title: t.modules.sleep,         icon: 'sleep',            route: '/record/sleep',           color: '#283593' },
    { key: 'rehab',         title: t.modules.rehab,         icon: 'run',              route: '/record/rehab',           color: '#00838F' },
  ];

  const loadData = useCallback(async () => {
    try {
      const [u, vitals, nutrition, assessment, cat] = await Promise.all([
        getUser(),
        getLatestVitals(),
        getLatestNutrition(),
        getRiskAssessment(),
        getLatestCATScore(),
      ]);
      setUser(u);
      setLatestVitals(vitals);
      setLatestNutrition(nutrition);
      setRiskAssessment(assessment);
      setExacerbationRisk(assessment.level);
      setLatestCAT(cat);
    } catch (e) {
      console.error('Load data failed:', e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const today = new Date().toISOString().slice(0, 10);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 用户问候 + 语言切换 */}
      <Surface style={styles.greeting} elevation={0}>
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{t.home.greeting}{user?.nickname || '...'}</Text>
            <Text style={styles.dateText}>{t.home.today}{today}</Text>
          </View>
          <Button
            mode="text" compact textColor="#2E7D32"
            onPress={() => setLanguage(lang === 'zh' ? 'en' : 'zh')}
            style={styles.langBtn}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </Button>
        </View>
      </Surface>

      {/* 🔴 危急值告警横幅 — SpO₂ < 88% */}
      {latestVitals?.spo2 != null && latestVitals.spo2 < 88 && (
        <Surface style={styles.criticalBanner}>
          <View style={styles.criticalRow}>
            <MaterialCommunityIcons name="alert-octagon" size={28} color="#FFF" />
            <View style={styles.criticalTextWrap}>
              <Text style={styles.criticalTitle}>
                {t.home.criticalTitle}
              </Text>
              <Text style={styles.criticalValue}>
                {t.home.quickLabelSpo2}：{latestVitals.spo2}% ({t.home.today}{latestVitals.record_date})
              </Text>
              <Text style={styles.criticalAction}>
                {t.home.criticalAction}
              </Text>
            </View>
          </View>
        </Surface>
      )}

      {/* 🟠 中危值告警横幅 — SpO₂ 88-90% */}
      {latestVitals?.spo2 != null && latestVitals.spo2 >= 88 && latestVitals.spo2 < 90 && (
        <Surface style={styles.severeBanner}>
          <View style={styles.criticalRow}>
            <MaterialCommunityIcons name="alert" size={26} color="#FFF" />
            <View style={styles.criticalTextWrap}>
              <Text style={styles.severeTitle}>
                {t.home.severeTitle}
              </Text>
              <Text style={styles.severeValue}>
                {t.home.quickLabelSpo2}：{latestVitals.spo2}% ({t.home.today}{latestVitals.record_date})
              </Text>
              <Text style={styles.severeAction}>
                {t.home.severeAction}
              </Text>
            </View>
          </View>
        </Surface>
      )}

      {/* 🏥 综合健康评分横幅 — 仅在有CAT评分+急性加重史时显示（GOLD指南要求） */}
      {riskAssessment && user && riskAssessment.hasGoldData && (
        <Surface style={[
          styles.healthBanner,
          riskAssessment.level === 'high' ? styles.healthBannerHigh :
          riskAssessment.level === 'medium' ? styles.healthBannerMed :
          styles.healthBannerLow,
        ]}>
          <View style={styles.healthBannerRow}>
            <View style={styles.healthScoreWrap}>
              <Text style={styles.healthLabel}>{t.home.healthLabel}</Text>
              <Text style={styles.healthGroup}>
                {t.home.goldGroup.replace('{group}', riskAssessment.goldGroup)}
              </Text>
            </View>
            <View style={styles.healthBadge}>
              <Text style={styles.healthBadgeText}>
                {riskAssessment.level === 'high' ? t.home.riskHigh :
                 riskAssessment.level === 'medium' ? t.home.riskMedium : t.home.riskLow}
              </Text>
            </View>
          </View>
          <Text style={styles.healthSummary}>{(() => {
            const r = riskAssessment;
            if (r.goldGroup === 'E') {
              return r.wasHospitalized ? t.home.summaryE : t.home.summaryE2.replace('{count}', String(r.exacerbationCount));
            }
            if (r.goldGroup === 'B') return t.home.summaryB;
            return r.diseaseActivity === 'low' ? t.home.summaryALow : t.home.summaryAActive;
          })()}</Text>
          <View style={styles.healthDetails}>
            {riskAssessment.catScore !== null && (
              <Text style={styles.healthDetail}>{t.home.catScore}{riskAssessment.catScore}{t.home.points}</Text>
            )}
            <Text style={styles.healthDetail}>
              {t.home.exacerbations}{riskAssessment.exacerbationCount}{t.home.perYear}
              {riskAssessment.wasHospitalized ? t.home.wasHospitalized : ''}
            </Text>
          </View>
        </Surface>
      )}

      {/* 📋 行动计划入口（最重要模块 — 醒目入口） */}
      <TouchableOpacity
        onPress={() => router.push('/action-plan')}
        activeOpacity={0.8}
        style={{ paddingHorizontal: 12, marginTop: 8 }}
      >
        <Surface style={styles.actionPlanEntry} elevation={2}>
          <View style={styles.actionPlanIcon}>
            <MaterialCommunityIcons name="file-document-edit" size={32} color="#FFF" />
          </View>
          <View style={styles.actionPlanText}>
            <Text style={styles.actionPlanTitle}>{t.home.actionPlan}</Text>
            <Text style={styles.actionPlanSub}>
              {t.home.actionPlanSub}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#2E7D32" />
        </Surface>
      </TouchableOpacity>

      {/* � 疾病总结入口（醒目入口） */}
      <TouchableOpacity
        onPress={() => router.push('/summary')}
        activeOpacity={0.8}
        style={{ paddingHorizontal: 12, marginTop: 8 }}
      >
        <Surface style={styles.summaryEntry} elevation={2}>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons name="file-document" size={32} color="#FFF" />
          </View>
          <View style={styles.actionPlanText}>
            <Text style={styles.actionPlanTitle}>{t.home.summaryEntry}</Text>
            <Text style={styles.actionPlanSub}>
              {t.home.summarySub}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#0277BD" />
        </Surface>
      </TouchableOpacity>

      {/* �📊 今日关键指标 */}
      <Text style={styles.sectionTitle}>{t.home.todayKeyIndicators}</Text>
      <View style={styles.quickCards}>
        <Surface style={[
          styles.quickCard,
          latestVitals?.spo2 != null && latestVitals.spo2 < 90 ? styles.quickCardWarn : {},
          latestVitals?.spo2 != null && latestVitals.spo2 < 88 ? styles.quickCardDanger : {},
        ]}>
          <MaterialCommunityIcons name="molecule" size={24} color={
            latestVitals?.spo2 != null && latestVitals.spo2 < 88 ? '#C62828' :
            latestVitals?.spo2 != null && latestVitals.spo2 < 90 ? '#E65100' : '#1565C0'
          } />
          <Text style={styles.quickLabel}>{t.home.quickLabelSpo2}</Text>
          <Text style={[
            styles.quickValue,
            latestVitals?.spo2 != null && latestVitals.spo2 < 90 ? styles.quickValueWarn : {},
          ]}>
            {latestVitals?.spo2 != null ? `${latestVitals.spo2}%` : '--'}
          </Text>
        </Surface>
        <Surface style={styles.quickCard}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color={
            latestVitals?.heart_rate != null && latestVitals.heart_rate > 100 ? '#C62828' : '#1565C0'
          } />
          <Text style={styles.quickLabel}>{t.home.quickLabelHr}</Text>
          <Text style={styles.quickValue}>
            {latestVitals?.heart_rate != null ? `${latestVitals.heart_rate}` : '--'}
          </Text>
        </Surface>
        <Surface style={[
          styles.quickCard,
          latestCAT !== null && latestCAT >= 20 ? styles.quickCardWarn : {},
        ]}>
          <MaterialCommunityIcons name="clipboard-list" size={24} color="#6A1B9A" />
          <Text style={styles.quickLabel}>{t.home.quickLabelCat}</Text>
          <Text style={[
            styles.quickValue,
            latestCAT !== null && latestCAT >= 20 ? styles.quickValueWarn : {},
          ]}>
            {latestCAT !== null ? `${latestCAT}${t.home.points}` : '--'}
          </Text>
        </Surface>
      </View>

      {/* ⚡ 高频操作入口（4 个大按钮） */}
      <Text style={styles.sectionTitle}>{t.home.quickRecord}</Text>
      <View style={styles.quickActions}>
        {QUICK_MODULES.map((mod) => (
          <TouchableOpacity
            key={mod.key}
            style={styles.quickActionItem}
            onPress={() => router.push(mod.route)}
            activeOpacity={0.7}
          >
            <Surface style={[styles.quickActionCard, { backgroundColor: mod.color }]} elevation={2}>
              <MaterialCommunityIcons name={mod.icon} size={32} color="#FFF" />
              <Text style={styles.quickActionTitle}>{mod.title}</Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📁 全部监测板块（可折叠） */}
      <TouchableOpacity
        style={styles.sectionRow}
        onPress={() => setShowAllModules(!showAllModules)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>{t.home.allModules}</Text>
        <MaterialCommunityIcons
          name={showAllModules ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#2E7D32"
        />
      </TouchableOpacity>
      {showAllModules && (
        <View style={styles.grid}>
          {ALL_MODULES.map((mod) => (
            <TouchableOpacity
              key={mod.key}
              style={styles.gridItem}
              onPress={() => router.push(mod.route)}
              activeOpacity={0.7}
            >
              <Surface style={[styles.gridCard, { borderTopColor: mod.color }]} elevation={1}>
                <MaterialCommunityIcons name={mod.icon} size={28} color={mod.color} />
                <Text style={styles.gridTitle}>{mod.title}</Text>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 患者资料入口 */}
      <TouchableOpacity
        style={styles.documentsBtn}
        onPress={() => router.push('/documents')}
        activeOpacity={0.7}
      >
        <Surface style={styles.documentsCard} elevation={1}>
          <MaterialCommunityIcons name="folder-image" size={24} color="#2E7D32" />
          <Text style={styles.documentsText}>{t.home.documentsEntry}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </Surface>
      </TouchableOpacity>

      {/* 预警提示 */}
      <View style={styles.alertSection}>
        <Text style={styles.sectionTitle}>{t.home.healthReminder}</Text>
        {exacerbationRisk === 'high' && riskAssessment && (
          <Card style={styles.alertCardDanger}>
            <Card.Content>
              <View style={styles.alertRow}>
                <MaterialCommunityIcons name="alert-octagon" size={22} color="#C62828" />
                <Text style={styles.alertDangerText}>
                  {riskAssessment.wasHospitalized
                    ? t.home.summaryE
                    : t.home.summaryE2.replace('{count}', String(riskAssessment.exacerbationCount))}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        {exacerbationRisk === 'medium' && (
          <Card style={styles.alertCardWarning}>
            <Card.Content>
              <View style={styles.alertRow}>
                <MaterialCommunityIcons name="alert" size={22} color="#E65100" />
                <Text style={styles.alertWarningText}>
                  {t.home.summaryB}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        <Card style={styles.alertCard}>
          <Card.Content>
            <Text style={styles.alertText}>
              {t.home.warningText}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* 🧪 测试数据（仅截图用） */}
      <TouchableOpacity
        style={styles.seedBtn}
        onPress={async () => {
          await seedScreenshotData();
          await loadData();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.seedBtnText}>🧪 Load Test Data (for screenshots)</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ── 容器 ──
  container: { flex: 1, backgroundColor: Colors.surfaceBg },

  // ── 问候区 ──
  greeting: { padding: Spacing.xl, backgroundColor: Colors.primaryLight, marginBottom: 4, borderRadius: 0 },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  langBtn: { borderRadius: Radius.sm, minWidth: 40 },
  greetingText: { fontSize: FontSize.h2, fontWeight: '700', color: Colors.primaryDark, letterSpacing: 0.3 },
  dateText: { fontSize: FontSize.tiny + 1, color: Colors.textMed, marginTop: 4 },

  // ── 危急值告警 ──
  criticalBanner: { backgroundColor: Colors.error, marginHorizontal: Spacing.lg, marginTop: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.lg, elevation: 4 },
  criticalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  criticalTextWrap: { flex: 1 },
  criticalTitle: { fontSize: FontSize.body, fontWeight: '700', color: Colors.textWhite, marginBottom: 4 },
  criticalValue: { fontSize: FontSize.caption, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  criticalAction: { fontSize: FontSize.tiny + 1, color: '#FFCDD2', fontWeight: '700', lineHeight: 18 },
  severeBanner: { backgroundColor: Colors.warning, marginHorizontal: Spacing.lg, marginTop: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.lg, elevation: 4 },
  severeTitle: { fontSize: FontSize.body, fontWeight: '700', color: Colors.textWhite, marginBottom: 4 },
  severeValue: { fontSize: FontSize.caption, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  severeAction: { fontSize: FontSize.tiny + 1, color: Colors.textWhite, fontWeight: '700', lineHeight: 18 },

  // ── 综合评估横幅 ──
  healthBanner: { marginHorizontal: Spacing.lg, marginTop: Spacing.sm, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.elevated },
  healthBannerHigh: { backgroundColor: Colors.errorBg, borderLeftWidth: 4, borderLeftColor: Colors.error },
  healthBannerMed: { backgroundColor: Colors.warningBg, borderLeftWidth: 4, borderLeftColor: Colors.warning },
  healthBannerLow: { backgroundColor: Colors.successBg, borderLeftWidth: 4, borderLeftColor: Colors.success },
  healthBannerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  healthScoreWrap: { flex: 1 },
  healthLabel: { fontSize: FontSize.tiny + 1, color: Colors.textMed, letterSpacing: 0.5 },
  healthGroup: { fontSize: FontSize.h1, fontWeight: '700', color: Colors.textHigh, marginTop: 2 },
  healthBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.85)' },
  healthBadgeText: { fontSize: FontSize.caption, fontWeight: '700' },
  healthSummary: { fontSize: FontSize.caption, color: Colors.textMed, lineHeight: 20, marginBottom: 6 },
  healthDetails: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  healthDetail: { fontSize: FontSize.tiny, color: Colors.textLow },

  // ── 行动计划入口 ──
  actionPlanEntry: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: Radius.lg, backgroundColor: Colors.successBg, gap: 12, marginHorizontal: Spacing.lg, marginTop: Spacing.sm, ...Shadow.card },
  actionPlanIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  actionPlanText: { flex: 1 },
  actionPlanTitle: { fontSize: FontSize.body, fontWeight: '700', color: Colors.primaryDark },
  actionPlanSub: { fontSize: FontSize.tiny + 1, color: Colors.textMed, marginTop: 3, lineHeight: 18 },

  // ── 疾病总结入口 ──
  summaryEntry: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: Radius.lg, backgroundColor: Colors.surface, gap: 12, marginHorizontal: Spacing.lg, marginTop: Spacing.sm, ...Shadow.card },
  summaryIcon: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },

  // ── 今日关键指标 ──
  sectionTitle: { fontSize: FontSize.body, fontWeight: '700', color: Colors.textHigh, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.sm, letterSpacing: 0.3 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: Spacing.lg },
  quickCards: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xs, borderRadius: Radius.md, backgroundColor: Colors.surface, ...Shadow.card },
  quickCardWarn: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: Colors.warning },
  quickCardDanger: { backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: Colors.error },
  quickLabel: { fontSize: FontSize.tiny, color: Colors.textMed, marginTop: Spacing.xs },
  quickValue: { fontSize: FontSize.metric, fontWeight: '700', color: Colors.textHigh, marginTop: Spacing.xs, fontVariant: ['tabular-nums'] },
  quickValueWarn: { color: Colors.warning },

  // ── 快捷操作 ──
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  quickActionItem: { width: '48%' },
  quickActionCard: { padding: Spacing.xl, borderRadius: Radius.lg, alignItems: 'center', minHeight: 80, ...Shadow.card },
  quickActionTitle: { fontSize: FontSize.tiny + 1, textAlign: 'center', color: Colors.textWhite, marginTop: Spacing.sm, fontWeight: '600', lineHeight: 18 },

  // ── 全部监测板块 ──
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg },
  gridItem: { width: '33.33%', padding: 4 },
  gridCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xs, borderRadius: Radius.md, borderTopWidth: 3, backgroundColor: Colors.surface, minHeight: 80, ...Shadow.card },
  gridTitle: { fontSize: FontSize.tiny + 1, textAlign: 'center', color: Colors.textHigh, marginTop: Spacing.sm, lineHeight: 17 },

  // ── 患者资料入口 ──
  documentsBtn: { paddingHorizontal: Spacing.lg, marginTop: Spacing.sm },
  documentsCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: Radius.lg, backgroundColor: Colors.surface, gap: 12, ...Shadow.card },
  documentsText: { flex: 1, fontSize: 15, color: Colors.textHigh },

  // ── 预警提示 ──
  alertSection: { paddingHorizontal: Spacing.lg },
  alertCardDanger: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, marginBottom: Spacing.sm },
  alertCardWarning: { backgroundColor: Colors.warningBg, borderRadius: Radius.md, marginBottom: Spacing.sm },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertDangerText: { flex: 1, fontSize: FontSize.caption, color: Colors.error, lineHeight: 20 },
  alertWarningText: { flex: 1, fontSize: FontSize.caption, color: Colors.warning, lineHeight: 20 },
  alertCard: { backgroundColor: '#FFF8E1', borderRadius: Radius.md },
  alertText: { fontSize: FontSize.tiny + 1, color: Colors.warning },

  // ── 种子数据按钮 ──
  seedBtn: { padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.sm },
  seedBtnText: { fontSize: 13, color: Colors.textLow, textDecorationLine: 'underline' },
});
