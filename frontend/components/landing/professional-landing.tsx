"use client";

import React from "react";
import {useRouter} from "next/navigation";
import RotatingLogo from "@/components/ui/rotating-logo";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const ProfessionalLandingPage = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/chat");
  };

  const processSteps = [
    {
      number: "01",
      title: "Secure Document Upload",
      description:
        "Upload compliance documents with enterprise-grade security protocols",
      icon: DocumentCheckIcon,
      color: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      number: "02",
      title: "Intelligent Analysis",
      description:
        "AI-powered metadata extraction and compliance framework mapping",
      icon: SparklesIcon,
      color: "from-indigo-50 to-indigo-100",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-200",
    },
    {
      number: "03",
      title: "Framework Alignment",
      description:
        "Automated compliance verification across multiple regulatory standards",
      icon: ShieldCheckIcon,
      color: "from-cyan-50 to-cyan-100",
      iconColor: "text-cyan-600",
      borderColor: "border-cyan-200",
    },
    {
      number: "04",
      title: "Comprehensive Reports",
      description:
        "Detailed compliance analysis with actionable insights and recommendations",
      icon: ChartBarIcon,
      color: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
  ];

  const benefits = [
    {
      icon: ClockIcon,
      title: "Significant Time Reduction",
      description: "Accelerate compliance reviews from weeks to hours",
      metric: "Variable",
    },
    {
      icon: CheckCircleIcon,
      title: "High Accuracy",
      description: "AI-powered precision in regulatory compliance detection",
      metric: "Configurable",
    },
    {
      icon: UserGroupIcon,
      title: "Multi-Framework",
      description: "Configurable for any framework on the planet",
      metric: "Universal",
    },
  ];

  const features = [
    {
      title: "Advanced Security",
      description:
        "End-to-end encryption, role-based access, and comprehensive audit trails",
      icon: ShieldCheckIcon,
    },
    {
      title: "Multi-Framework Support",
      description: "SOX, COSO, COBIT, ISO, and configurable for any framework on the planet",
      icon: DocumentCheckIcon,
    },
    {
      title: "Real-time Collaboration",
      description: "Team workspaces with version control and review workflows",
      icon: UserGroupIcon,
    },
    {
      title: "Automated Reporting",
      description:
        "Generate comprehensive compliance reports in multiple formats",
      icon: ChartBarIcon,
    },
    {
      title: "API Integration",
      description:
        "Seamless integration with existing audit management systems",
      icon: SparklesIcon,
    },
    {
      title: "Performance Analytics",
      description: "Track compliance metrics and identify process improvements",
      icon: ClockIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          {/* Logo and Branding */}
          <div className="text-center mb-16">
            <RotatingLogo size="xl" className="mb-8" />
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Trusted by Enterprise Audit Teams
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
              Intelligent Compliance
              <span className="block text-blue-600">Analysis Platform</span>
            </h1>

            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Transform your regulatory compliance workflow with AI-powered
              document analysis, automated framework mapping, and comprehensive
              audit trail generation.
            </p>

            {/* Key Benefits Bar */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 mx-auto">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {benefit.metric}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Streamlined Compliance Workflow
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our four-step process ensures comprehensive compliance analysis
              while maintaining the highest standards of security and accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connection Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-blue-300 z-0"></div>
                )}

                <div
                  className={`relative bg-gradient-to-br ${step.color} rounded-2xl p-8 border ${step.borderColor} hover:shadow-lg transition-all duration-300 group-hover:scale-105 z-10`}
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>

                  <div className={`w-12 h-12 ${step.iconColor} mb-6`}>
                    <step.icon className="w-full h-full" />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Indicators */}
          <div className="flex justify-center items-center space-x-8 mb-12 opacity-80">
            <div className="flex items-center space-x-2 text-blue-100">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="text-sm font-medium">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">ISO 27001 Certified</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <DocumentCheckIcon className="w-5 h-5" />
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block">Compliance Process?</span>
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join leading audit teams who have revolutionized their compliance
            workflows with AI-powered analysis and automated reporting.
          </p>

          {/* Enhanced CTA Button */}
          <div className="space-y-6">
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center justify-center px-12 py-4 bg-white text-blue-700 font-semibold rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <span className="mr-3">Start Compliance Analysis</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <p className="text-blue-200 text-sm">
              No setup required • Enterprise security • Immediate results
            </p>
          </div>

          {/* Mission Statement */}
          <div className="mt-16 pt-12 border-t border-blue-500/30">
            <p className="text-blue-200 text-sm mb-6">
              Built for compliance professionals who value:
            </p>
            <div className="flex justify-center items-center space-x-12 opacity-60">
              <div className="text-blue-100 font-medium">
                Accuracy
              </div>
              <div className="text-blue-100 font-medium">Transparency</div>
              <div className="text-blue-100 font-medium">Reliability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built specifically for professional audit environments with
              enterprise security and scalability requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLandingPage;
