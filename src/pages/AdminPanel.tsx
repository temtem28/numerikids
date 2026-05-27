import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileQuestion, Map, Mail, FileText, BarChart3, TestTube, Beaker, Brain, Lightbulb, Zap, TrendingUp, Users, Sparkles, Type, Clock, Shield, AlertTriangle, Gift, ShieldCheck, Activity } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

import LessonManager from '@/components/admin/LessonManager';
import { LessonImporter } from '@/components/admin/LessonImporter';
import QuizManager from '@/components/admin/QuizManager';
import SagaManager from '@/components/admin/SagaManager';
import EmailQueueMonitor from '@/components/admin/EmailQueueMonitor';
import EmailTemplateManager from '@/components/admin/EmailTemplateManager';
import { EmailAnalyticsDashboard } from '@/components/admin/EmailAnalyticsDashboard';
import { ABTestDashboard } from '@/components/admin/ABTestDashboard';
import { ABTestCreator } from '@/components/admin/ABTestCreator';
import { MultiVariateTestCreator } from '@/components/admin/MultiVariateTestCreator';
import { MVTDashboard } from '@/components/admin/MVTDashboard';
import PredictionDashboard from '@/components/admin/PredictionDashboard';
import TemplateAnalyzer from '@/components/admin/TemplateAnalyzer';
import AutoOptimizationDashboard from '@/components/admin/AutoOptimizationDashboard';
import LearningMetrics from '@/components/admin/LearningMetrics';
import SegmentBuilder from '@/components/admin/SegmentBuilder';
import SegmentList from '@/components/admin/SegmentList';
import SegmentPerformanceChart from '@/components/admin/SegmentPerformanceChart';
import SegmentRecommendations from '@/components/admin/SegmentRecommendations';
import PersonalizationDashboard from '@/components/admin/PersonalizationDashboard';
import SubjectLineGenerator from '@/components/admin/SubjectLineGenerator';
import SubjectLineTester from '@/components/admin/SubjectLineTester';
import SubjectLineLibrary from '@/components/admin/SubjectLineLibrary';
import { SendTimeOptimizer } from '@/components/admin/SendTimeOptimizer';
import { EmailTimeAnalysis } from '@/components/admin/EmailTimeAnalysis';
import { supabase } from '@/lib/supabase';
import DeliverabilityDashboard from '@/components/admin/DeliverabilityDashboard';
import ReputationMonitor from '@/components/admin/ReputationMonitor';
import BlacklistMonitor from '@/components/admin/BlacklistMonitor';
import DunningDashboard from '@/components/admin/DunningDashboard';
import { ReferralAnalyticsDashboard } from '@/components/admin/ReferralAnalyticsDashboard';
import { RLSTestRunner } from '@/components/admin/RLSTestRunner';
import RLSMonitoringDashboard from '@/components/admin/RLSMonitoringDashboard';
import RLSAlertSettings from '@/components/admin/RLSAlertSettings';

export default function AdminPanel() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [showABTestCreator, setShowABTestCreator] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(user.email?.includes('admin') || false);
    };
    checkAdmin();
  }, [user]);

  React.useEffect(() => {
    const loadTemplates = async () => {
      const { data } = await supabase.from('email_templates').select('*');
      if (data) setTemplates(data);
    };
    loadTemplates();
  }, []);

  const handleCreateTest = async (testData: any) => {
    const { data: test } = await supabase
      .from('ab_tests')
      .insert({
        name: testData.name,
        description: testData.description,
        template_name: testData.templateName,
        test_type: testData.testType,
        min_sample_size: testData.minSampleSize,
        status: 'draft'
      })
      .select()
      .single();

    if (test) {
      for (const variant of testData.variants) {
        await supabase.from('ab_test_variants').insert({
          test_id: test.id,
          name: variant.name,
          is_control: variant.isControl,
          traffic_percentage: variant.trafficPercentage,
          subject_line: variant.subjectLine,
          template_content: variant.templateContent
        });
      }
    }

    setShowABTestCreator(false);
  };

  if (isAdmin === null) {
    return (
      <DashboardLayout title="Admin Panel">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout title="Admin Panel" subtitle="Gérez le contenu et les paramètres de la plateforme">
      <div className="p-6">
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="flex flex-wrap gap-1 mb-8 bg-slate-900/50 border border-cyan-500/20 p-2 rounded-lg">
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4" />
              <span className="hidden sm:inline">Quizzes</span>
            </TabsTrigger>
            <TabsTrigger value="sagas" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Sagas</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email Queue</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="abtests" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">A/B Tests</span>
            </TabsTrigger>
            <TabsTrigger value="mvt" className="flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              <span className="hidden sm:inline">MVT</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Analyzer</span>
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Auto-Opt</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Learning</span>
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Segments</span>
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="subjectlines" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Subjects</span>
            </TabsTrigger>
            <TabsTrigger value="sendtime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Send Time</span>
            </TabsTrigger>
            <TabsTrigger value="deliverability" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Delivery</span>
            </TabsTrigger>
            <TabsTrigger value="dunning" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Dunning</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Referrals</span>
            </TabsTrigger>
            <TabsTrigger value="rlstests" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">RLS Tests</span>
            </TabsTrigger>
            <TabsTrigger value="rlsmonitor" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">RLS Monitor</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
            <div className="space-y-6">
              <LessonImporter />
              <LessonManager />
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizManager />
          </TabsContent>

          <TabsContent value="sagas">
            <SagaManager />
          </TabsContent>

          <TabsContent value="emails">
            <EmailQueueMonitor />
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="analytics">
            <EmailAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="abtests">
            {showABTestCreator ? (
              <ABTestCreator 
                templates={templates}
                onSave={handleCreateTest}
                onCancel={() => setShowABTestCreator(false)}
              />
            ) : (
              <ABTestDashboard onCreateNew={() => setShowABTestCreator(true)} />
            )}
          </TabsContent>

          <TabsContent value="mvt">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MultiVariateTestCreator />
              <MVTDashboard />
            </div>
          </TabsContent>

          <TabsContent value="predictions">
            <PredictionDashboard />
          </TabsContent>

          <TabsContent value="analyzer">
            <TemplateAnalyzer />
          </TabsContent>

          <TabsContent value="optimization">
            <AutoOptimizationDashboard />
          </TabsContent>

          <TabsContent value="learning">
            <LearningMetrics />
          </TabsContent>

          <TabsContent value="segments">
            <div className="space-y-6">
              <SegmentBuilder />
              {selectedSegment ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SegmentPerformanceChart segmentId={selectedSegment} />
                  <SegmentRecommendations segmentId={selectedSegment} />
                </div>
              ) : (
                <SegmentList onSelectSegment={setSelectedSegment} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="personalization">
            <PersonalizationDashboard />
          </TabsContent>

          <TabsContent value="subjectlines">
            <Tabs defaultValue="generator" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="generator">Generator</TabsTrigger>
                <TabsTrigger value="tester">Tester</TabsTrigger>
                <TabsTrigger value="library">Library</TabsTrigger>
              </TabsList>
              <TabsContent value="generator">
                <SubjectLineGenerator />
              </TabsContent>
              <TabsContent value="tester">
                <SubjectLineTester />
              </TabsContent>
              <TabsContent value="library">
                <SubjectLineLibrary />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="sendtime">
            <Tabs defaultValue="optimizer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              <TabsContent value="optimizer">
                <SendTimeOptimizer />
              </TabsContent>
              <TabsContent value="analysis">
                <EmailTimeAnalysis />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="deliverability">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="reputation">Reputation</TabsTrigger>
                <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard">
                <DeliverabilityDashboard />
              </TabsContent>
              <TabsContent value="reputation">
                <ReputationMonitor />
              </TabsContent>
              <TabsContent value="blacklist">
                <BlacklistMonitor />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="dunning">
            <DunningDashboard />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="rlstests">
            <RLSTestRunner />
          </TabsContent>

          <TabsContent value="rlsmonitor">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard">
                <RLSMonitoringDashboard />
              </TabsContent>
              <TabsContent value="alerts">
                <RLSAlertSettings />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
