"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import ClientWalletButton from "@/components/ClientWalletButton";
import { 
  HardHat, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  ArrowRight, 
  ChevronLeft, 
  UploadCloud, 
  Check, 
  Loader2,
  FileCheck2,
  AlertTriangle
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

// ── Словари ────────────────────────────────────────────────────────
const TRANSLATIONS = {
  ru: {
    authTitle: "Терминал Технадзора",
    authDesc: "Доступ только для авторизованных инженеров технического надзора (Oracle Node).",
    cabinetTitle: "Кабинет Оракула",
    licenseActive: "Лицензия активна",
    myObjects: "Мои объекты",
    total: "Всего",
    goToObject: "Перейти к объекту",
    backToList: "Назад к списку",
    requiresConfirmation: "Требуется подтверждение",
    trancheAmount: "Сумма транша",
    checklist: "Чек-лист инспекции",
    proofOfAsset: "Доказательства (Proof of Asset)",
    uploadPhoto: "Загрузить фото/видео",
    uploadPdf: "Загрузить акт (PDF)",
    upload3d: "Загрузить 3D Скан (LIDAR)",
    signButton: "Подписать акт и разблокировать транш",
    signing: "Подписание транзакции...",
    success: "ТРАНЗАКЦИЯ ПОДТВЕРЖДЕНА. ТРАНШ РАЗБЛОКИРОВАН.",
    warningCheckboxes: "Необходимо подтвердить все пункты чек-листа для разблокировки подписи",
    inspectionNotRequired: "На данный момент инспекция не требуется",
    inspectionNotReqDesc: "Объект находится в процессе строительства или следующий этап еще не запрошен."
  },
  en: {
    authTitle: "Tech Supervision Terminal",
    authDesc: "Access restricted to authorized technical supervision engineers (Oracle Node) only.",
    cabinetTitle: "Oracle Cabinet",
    licenseActive: "License Active",
    myObjects: "My Objects",
    total: "Total",
    goToObject: "Go to object",
    backToList: "Back to list",
    requiresConfirmation: "Requires Confirmation",
    trancheAmount: "Tranche amount",
    checklist: "Inspection Checklist",
    proofOfAsset: "Proof of Asset",
    uploadPhoto: "Upload Photo/Video",
    uploadPdf: "Upload PDF Act",
    upload3d: "Upload 3D Scan (LIDAR)",
    signButton: "Sign act & unlock tranche",
    signing: "Signing Transaction...",
    success: "TRANSACTION CONFIRMED. TRANCHE UNLOCKED.",
    warningCheckboxes: "All checklist items must be confirmed to unlock signature",
    inspectionNotRequired: "Inspection not currently required",
    inspectionNotReqDesc: "The object is currently under construction or the next stage hasn't been requested."
  }
};

type Lang = 'ru' | 'en';

// ── Моковые данные ────────────────────────────────────────────────
const MOCK_PROJECTS = [
  {
    id: "proj_1",
    name: "ЖК Sunrise",
    address: { ru: "ул. Строителей, 12, блок А", en: "Stroiteley st, 12, block A" },
    statusText: { ru: "Ожидает инспекции: Этап 2", en: "Pending Inspection: Phase 2" },
    statusType: "pending",
    trancheAmount: "50,000 USDC",
    stageName: { ru: "Этап 2: Заливка фундамента", en: "Phase 2: Foundation pouring" },
    checks: [
      { ru: "Материалы соответствуют смете (ГОСТ 27751-2014)", en: "Materials match the estimate (GOST 27751-2014)" },
      { ru: "Объем бетонных работ выполнен на 100%", en: "Concrete works volume is 100% complete" },
      { ru: "Арматурный каркас соответствует чертежам", en: "Reinforcement frame matches drawings" },
      { ru: "Фотоотчет и 3D-скан (LIDAR) прикреплены", en: "Photo report and 3D scan (LIDAR) attached" },
    ]
  },
  {
    id: "proj_2",
    name: "БЦ Nomads",
    address: { ru: "пр. Мангилик Ел, 44", en: "Mangilik El ave, 44" },
    statusText: { ru: "В процессе строительства", en: "Under Construction" },
    statusType: "in_progress",
    trancheAmount: "120,000 USDC",
    stageName: { ru: "Этап 4: Монтаж фасада", en: "Phase 4: Facade installation" },
    checks: [
      { ru: "Фасадные панели соответствуют спецификации", en: "Facade panels match specification" },
      { ru: "Крепления установлены без дефектов", en: "Mounts installed without defects" },
      { ru: "Теплоизоляция уложена сплошным слоем", en: "Thermal insulation applied in a continuous layer" },
    ]
  },
  {
    id: "proj_3",
    name: "ЖК Green Park",
    address: { ru: "ул. Ботаническая, 7", en: "Botanicheskaya st, 7" },
    statusText: { ru: "Ожидает инспекции: Этап 1", en: "Pending Inspection: Phase 1" },
    statusType: "pending",
    trancheAmount: "25,000 USDC",
    stageName: { ru: "Этап 1: Подготовка котлована", en: "Phase 1: Pit preparation" },
    checks: [
      { ru: "Глубина котлована соответствует проекту", en: "Pit depth matches project specification" },
      { ru: "Стенки котлована укреплены", en: "Pit walls are reinforced" },
      { ru: "Грунтовые воды отведены", en: "Groundwater is diverted" },
      { ru: "Акт скрытых работ подписан", en: "Hidden works act is signed" },
    ]
  }
];

export default function OracleCabinet() {
  const wallet = useWallet();
  const { language } = useLanguage();
  const lang = language as Lang;
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];
  const selectedProject = MOCK_PROJECTS.find(p => p.id === selectedProjectId);

  useEffect(() => {
    if (selectedProject) {
      setCheckedItems(new Array(selectedProject.checks.length).fill(false));
      setSuccessMsg(null);
    }
  }, [selectedProjectId, selectedProject]);

  const handleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const allChecked = checkedItems.length > 0 && checkedItems.every(Boolean);

  const handleSign = async () => {
    if (!allChecked) return;
    
    setIsSigning(true);
    await new Promise(r => setTimeout(r, 2500));
    
    setIsSigning(false);
    setSuccessMsg(t.success);
    
    setTimeout(() => {
      setSelectedProjectId(null);
      setSuccessMsg(null);
    }, 3000);
  };



  // 1. Экран авторизации
  if (!wallet.connected) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">

        <div className="max-w-md w-full bg-slate-800 border-4 border-slate-700 p-8 shadow-2xl rounded-none relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-amber-500 flex items-center justify-center rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <HardHat className="text-slate-900 w-10 h-10" />
            </div>
            
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
              {t.authTitle}
            </h1>
            
            <div className="bg-red-900/30 border-l-4 border-red-500 p-4 w-full">
              <p className="text-red-400 text-sm font-mono leading-relaxed">
                {t.authDesc}
              </p>
            </div>
            
            <div className="w-full pt-4">
              <ClientWalletButton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. Главная страница (Дашборд)
  if (!selectedProjectId) {
    return (
      <main className="min-h-screen bg-slate-900 pb-20">

        {/* Хедер дашборда */}
        <header className="bg-slate-800 border-b-4 border-slate-700 pt-20 pb-6 px-4 md:px-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-amber-500 flex items-center justify-center rounded-none shrink-0 border-2 border-amber-400">
                <HardHat className="text-slate-900 w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                  {t.cabinetTitle}
                </h1>
                <p className="text-slate-400 font-mono text-sm mt-1">
                  ID: {wallet.publicKey?.toBase58().slice(0, 8)}...{wallet.publicKey?.toBase58().slice(-8)}
                </p>
              </div>
            </div>
            
            <div className="bg-green-900/40 border border-green-500 px-4 py-2 flex items-center space-x-2">
              <ShieldCheck className="text-green-500 w-5 h-5" />
              <span className="text-green-400 font-bold uppercase text-sm tracking-wider">
                {t.licenseActive}
              </span>
            </div>
          </div>
        </header>

        {/* Список объектов */}
        <div className="max-w-5xl mx-auto mt-8 px-4 md:px-8">
          <div className="flex items-center justify-between mb-6 border-b-2 border-slate-700 pb-2">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-400" />
              {t.myObjects}
            </h2>
            <span className="text-slate-500 font-mono text-sm">
              {t.total}: {MOCK_PROJECTS.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROJECTS.map((proj) => (
              <div 
                key={proj.id} 
                className="bg-slate-800 border-2 border-slate-700 hover:border-amber-500 transition-colors flex flex-col rounded-none group"
              >
                <div className="p-5 flex-1">
                  <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-amber-500 transition-colors">
                    {proj.name}
                  </h3>
                  <div className="flex items-start gap-2 text-slate-400 mb-4">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-sm">{proj.address[lang]}</span>
                  </div>
                  
                  <div className={`p-3 border-l-4 text-sm font-bold uppercase tracking-wide
                    ${proj.statusType === 'pending' 
                      ? 'bg-amber-900/20 border-amber-500 text-amber-500' 
                      : 'bg-slate-900/50 border-slate-500 text-slate-300'}`}
                  >
                    {proj.statusText[lang]}
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedProjectId(proj.id)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-4 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border-t-2 border-slate-600 rounded-none"
                >
                  {t.goToObject}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // 3. Страница объекта (Детальный вид)
  if (!selectedProject) return null;

  return (
    <main className="min-h-screen bg-slate-900 pt-20 pb-20">

      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Кнопка назад */}
        <button 
          onClick={() => setSelectedProjectId(null)}
          className="text-slate-400 hover:text-white flex items-center gap-2 font-mono text-sm uppercase tracking-wider mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.backToList}
        </button>

        {/* Заголовок объекта */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
            {selectedProject.name}
          </h1>
          <p className="text-slate-400 flex items-center gap-2 font-mono">
            <MapPin className="w-4 h-4" />
            {selectedProject.address[lang]}
          </p>
        </div>

        {selectedProject.statusType === 'pending' ? (
          <>
            {/* Плашка этапа */}
            <div className="bg-amber-500 text-slate-900 p-6 md:p-8 mb-8 border-4 border-amber-600 rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                  <p className="text-amber-900 font-black text-sm uppercase tracking-widest mb-1">
                    {t.requiresConfirmation}
                  </p>
                  <h2 className="text-2xl md:text-4xl font-black uppercase leading-none">
                    {selectedProject.stageName[lang]}
                  </h2>
                </div>
                <div className="bg-slate-900 text-white p-4 shrink-0 text-center border-2 border-slate-900 rounded-none">
                  <p className="text-slate-400 text-xs font-mono uppercase mb-1">{t.trancheAmount}</p>
                  <p className="text-2xl font-black">{selectedProject.trancheAmount}</p>
                </div>
              </div>
            </div>

            {/* Чеклист */}
            <div className="bg-slate-800 border-2 border-slate-700 p-6 md:p-8 mb-8 rounded-none">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                {t.checklist}
              </h3>
              
              <div className="space-y-4">
                {selectedProject.checks.map((checkObj, idx) => (
                  <label 
                    key={idx} 
                    className="flex items-start gap-4 p-4 border border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors group"
                  >
                    <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={checkedItems[idx]}
                        onChange={() => handleCheck(idx)}
                        className="peer appearance-none w-6 h-6 border-2 border-slate-500 checked:bg-amber-500 checked:border-amber-500 cursor-pointer rounded-none transition-colors"
                      />
                      <Check className="absolute w-4 h-4 text-slate-900 opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
                    </div>
                    <span className={`text-base font-medium transition-colors ${checkedItems[idx] ? 'text-white' : 'text-slate-300'}`}>
                      {checkObj[lang]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Доказательства (Proof of Asset) */}
            <div className="bg-slate-800 border-2 border-slate-700 p-6 md:p-8 mb-8 rounded-none">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 border-b border-slate-700 pb-4">
                {t.proofOfAsset}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="h-28 border-2 border-dashed border-slate-600 hover:border-amber-500 hover:bg-slate-700/30 flex flex-col items-center justify-center text-slate-400 hover:text-amber-500 transition-colors uppercase font-bold text-xs tracking-wider rounded-none p-2 text-center">
                  <UploadCloud className="w-6 h-6 mb-2" />
                  {t.uploadPhoto}
                </button>
                <button className="h-28 border-2 border-dashed border-slate-600 hover:border-amber-500 hover:bg-slate-700/30 flex flex-col items-center justify-center text-slate-400 hover:text-amber-500 transition-colors uppercase font-bold text-xs tracking-wider rounded-none p-2 text-center">
                  <FileCheck2 className="w-6 h-6 mb-2" />
                  {t.uploadPdf}
                </button>
                <button className="h-28 border-2 border-dashed border-slate-600 hover:border-amber-500 hover:bg-amber-500/10 flex flex-col items-center justify-center text-slate-400 hover:text-amber-500 transition-colors uppercase font-bold text-xs tracking-wider rounded-none p-2 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Building2 className="w-6 h-6 mb-2 relative z-10" />
                  <span className="relative z-10">{t.upload3d}</span>
                </button>
              </div>
            </div>

            {/* Уведомление об успехе */}
            {successMsg && (
              <div className="bg-green-500 text-green-950 p-6 font-black uppercase text-center text-xl md:text-2xl mb-8 animate-pulse rounded-none">
                {successMsg}
              </div>
            )}

            {/* Кнопка подписания */}
            {!successMsg && (
              <button 
                onClick={handleSign}
                disabled={!allChecked || isSigning}
                className={`w-full py-6 px-4 font-black text-xl md:text-2xl uppercase tracking-tighter flex items-center justify-center gap-4 transition-all rounded-none border-4
                  ${allChecked && !isSigning
                    ? 'bg-amber-500 text-slate-900 border-amber-600 hover:bg-amber-400 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none' 
                    : 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed'
                  }`}
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    {t.signing}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-8 h-8" />
                    {t.signButton}
                  </>
                )}
              </button>
            )}
            
            {/* Предупреждение если не все чекбоксы нажаты */}
            {!allChecked && !isSigning && !successMsg && (
              <p className="text-center text-slate-500 font-mono text-sm mt-4 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t.warningCheckboxes}
              </p>
            )}
          </>
        ) : (
          <div className="bg-slate-800 border-2 border-slate-700 p-12 text-center rounded-none">
            <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white uppercase mb-2">{t.inspectionNotRequired}</h3>
            <p className="text-slate-400">{t.inspectionNotReqDesc}</p>
          </div>
        )}
      </div>
    </main>
  );
}
