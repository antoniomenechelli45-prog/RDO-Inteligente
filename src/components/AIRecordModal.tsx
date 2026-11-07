import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Volume2,
  BookOpen,
  Info,
} from 'lucide-react';
import { parseRdoWithAI, METODO_LARISSA_EXEMPLO_PADRAO, EXEMPLOS_ADICIONAIS } from '../services/gemini';
import { AIParsedRDO } from '../types/rdo';

interface AIRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (parsed: AIParsedRDO, mode: 'merge' | 'replace') => void;
  geminiActive: boolean;
  onOpenConfig: () => void;
}

export const AIRecordModal: React.FC<AIRecordModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
  geminiActive,
  onOpenConfig,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'audio' | 'texto'>('audio');
  const [narrativeText, setNarrativeText] = useState('');

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // AI execution states
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<AIParsedRDO | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mergeMode, setMergeMode] = useState<'merge' | 'replace'>('merge');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(fullBlob);
        setAudioUrl(URL.createObjectURL(fullBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMsg(
        'Não foi possível acessar o microfone. Verifique as permissões do navegador ou utilize a aba "Relato Digitado".'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleResetAudio = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingSeconds(0);
    setParsedResult(null);
    setErrorMsg(null);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Strip data:audio/webm;base64,
        const cleanBase64 = base64data.split(',')[1];
        resolve(cleanBase64);
      };
      reader.onerror = reject;
    });
  };

  const handleProcessWithAI = async () => {
    setErrorMsg(null);
    setParsedResult(null);

    if (activeInputTab === 'audio' && !audioBlob && !narrativeText) {
      setErrorMsg('Grave um áudio primeiro ou mude para a aba de texto.');
      return;
    }
    if (activeInputTab === 'texto' && !narrativeText.trim()) {
      setErrorMsg('Digite ou carregue o relato do dia para a IA estruturar.');
      return;
    }

    setIsLoading(true);

    try {
      let audioBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (audioBlob) {
        audioBase64 = await blobToBase64(audioBlob);
        mimeType = audioBlob.type || 'audio/webm';
      }

      const result = await parseRdoWithAI({
        narrative: narrativeText.trim() || undefined,
        audioBase64,
        mimeType,
      });

      setParsedResult(result);
    } catch (err: any) {
      console.error('AI Error:', err);
      setErrorMsg(
        err.message || 'Erro ao processar com a IA. Verifique se o servidor está ativo e a chave Gemini configurada.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmApply = () => {
    if (!parsedResult) return;
    onApplyParsedData(parsedResult, mergeMode);
    onClose();
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Gravar RDO com IA</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Método Larissa
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fale pelo microfone no canteiro ou digite o relato da equipe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini warning if not configured */}
        {!geminiActive && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>GEMINI_API_KEY necessária para transcrição e estruturação automática.</span>
            </div>
            <button
              onClick={onOpenConfig}
              className="text-[11px] underline font-bold hover:text-white shrink-0 ml-2"
            >
              Ver status
            </button>
          </div>
        )}

        {/* Input Mode Selector (Audio vs Texto) */}
        {!parsedResult && (
          <div className="mt-5">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setActiveInputTab('audio')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition ${
                  activeInputTab === 'audio'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Gravação por Áudio (Voz no Canteiro)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInputTab('texto')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition ${
                  activeInputTab === 'texto'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Relato Digitado / Exemplo</span>
              </button>
            </div>

            {/* TAB AUDIO */}
            {activeInputTab === 'audio' && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 text-center space-y-4">
                <div className="relative inline-block">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isLoading}
                      className="w-20 h-20 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 transition mx-auto cursor-pointer"
                    >
                      <Mic className="w-8 h-8" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-red-600/40 animate-pulse mx-auto cursor-pointer"
                    >
                      <Square className="w-7 h-7 fill-white" />
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    {isRecording
                      ? `Gravando relato de canteiro... (${formatTimer(recordingSeconds)})`
                      : audioBlob
                      ? 'Áudio gravado com sucesso!'
                      : 'Toque no microfone para iniciar a gravação de voz'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {isRecording
                      ? 'Fale livremente sobre serviços, pedreiros, clima e ocorrências do dia.'
                      : 'Ideal para usar caminhando pelo canteiro de obras no celular.'}
                  </p>
                </div>

                {/* Audio preview playback */}
                {audioUrl && !isRecording && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Volume2 className="w-4 h-4 text-blue-400" />
                      <span>{formatTimer(recordingSeconds)} gravados</span>
                    </div>
                    <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
                    <button
                      onClick={handleResetAudio}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition"
                      title="Gravar novamente"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB TEXTO */}
            {activeInputTab === 'texto' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Relato do Dia (Transcrição ou Digitação)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      O motor IA estruturará cada campo
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={narrativeText}
                    onChange={(e) => setNarrativeText(e.target.value)}
                    placeholder="Ex: Hoje fizemos a concretagem das vigas, com quatro pedreiros e seis serventes. Concluímos 80%. Choveu pela manhã e paramos uma hora."
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                  />
                </div>

                {/* One-click examples from Larissa Method workshop */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Carregar Exemplos Práticos do Método Larissa:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {EXEMPLOS_ADICIONAIS.map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNarrativeText(ex.texto)}
                        className="text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                            {ex.titulo}
                          </span>
                          <span className="text-[10px] text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition">
                            Usar este exemplo →
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 italic">
                          &quot;{ex.texto}&quot;
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Action button to execute AI extraction */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleProcessWithAI}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Estruturando RDO com Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Processar Relato com IA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* AI Structured Review Screen (MANDATORY PER PDF RULES: "Exija revisão antes de incorporar os dados e nunca sobrescreva informações sem autorização") */}
        {parsedResult && (
          <div className="mt-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-800/70 text-blue-200 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">
                  Revisão Obrigatória antes de Incorporar (Método Larissa)
                </strong>
                Verifique os dados extraídos pelo Gemini abaixo antes de aplicar ao seu RDO. Apenas dados expressamente falados foram preenchidos.
              </div>
            </div>

            {/* Transcription if available */}
            {parsedResult.transcricao && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Transcrição Literal do Áudio:
                </span>
                <p className="text-slate-200 italic">&quot;{parsedResult.transcricao}&quot;</p>
              </div>
            )}

            {/* Structured cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Atividades */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-blue-400 uppercase tracking-wider block mb-2">
                  Atividades Identificadas ({parsedResult.atividades?.length || 0})
                </span>
                {parsedResult.atividades && parsedResult.atividades.length > 0 ? (
                  <ul className="space-y-1.5">
                    {parsedResult.atividades.map((a, i) => (
                      <li key={i} className="text-slate-200 border-l-2 border-blue-500 pl-2">
                        <strong className="text-white">{a.descricao}</strong>
                        {a.percentualDia !== null && (
                          <span className="text-blue-400 ml-1">({a.percentualDia}% da atividade)</span>
                        )}
                        {a.observacao && <p className="text-slate-400 text-[11px]">{a.observacao}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">Nenhuma citada (mantido em branco)</p>
                )}
              </div>

              {/* Mão de Obra */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-amber-400 uppercase tracking-wider block mb-2">
                  Mão de Obra Identificada ({parsedResult.maoDeObra?.length || 0})
                </span>
                {parsedResult.maoDeObra && parsedResult.maoDeObra.length > 0 ? (
                  <ul className="space-y-1">
                    {parsedResult.maoDeObra.map((m, i) => (
                      <li key={i} className="text-slate-200 flex justify-between">
                        <span>{m.funcao} ({m.tipo})</span>
                        <strong className="text-white">{m.quantidade} operários</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">Nenhum efetivo citado (mantido em branco)</p>
                )}
              </div>

              {/* Clima */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                  Condições Climáticas
                </span>
                {parsedResult.clima?.manha || parsedResult.clima?.condicaoGeral ? (
                  <div className="space-y-1 text-slate-200">
                    <p>Manhã: <strong className="text-white">{parsedResult.clima.manha || '-'}</strong></p>
                    {parsedResult.clima.tarde && <p>Tarde: <strong className="text-white">{parsedResult.clima.tarde}</strong></p>}
                    <p>Condição: <span className="text-slate-300">{parsedResult.clima.condicaoGeral || '-'}</span></p>
                    {parsedResult.clima.praticabilidade && (
                      <p>Praticabilidade: <strong className="text-emerald-400">{parsedResult.clima.praticabilidade}</strong></p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Não citado (mantido em branco)</p>
                )}
              </div>

              {/* Ocorrências */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-rose-400 uppercase tracking-wider block mb-2">
                  Ocorrências & Paralisações
                </span>
                {parsedResult.ocorrencias && parsedResult.ocorrencias.length > 0 ? (
                  <ul className="space-y-1.5">
                    {parsedResult.ocorrencias.map((o, i) => (
                      <li key={i} className="text-slate-200 border-l-2 border-rose-500 pl-2">
                        <strong className="text-white">[{o.tipo}]</strong> {o.descricao}
                        {o.tempoParalisado && (
                          <span className="text-rose-400 ml-1">({o.tempoParalisado})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">Sem ocorrências mencionadas</p>
                )}
              </div>
            </div>

            {/* Dúvidas ou Confirmações (Mandatory Larissa rule: sinalizar dúvidas como "Requer confirmação") */}
            {parsedResult.duvidasOuConfirmacoes && parsedResult.duvidasOuConfirmacoes.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-700/60 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Pontos de Atenção (Requer Confirmação):</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-amber-200/90">
                  {parsedResult.duvidasOuConfirmacoes.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Incorporation Options */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-300">Como incorporar ao formulário do RDO?</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="radio"
                    name="mergeMode"
                    value="merge"
                    checked={mergeMode === 'merge'}
                    onChange={() => setMergeMode('merge')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Mesclar com dados existentes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="radio"
                    name="mergeMode"
                    value="replace"
                    checked={mergeMode === 'replace'}
                    onChange={() => setMergeMode('replace')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Substituir campos identificados</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setParsedResult(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
              >
                Voltar e Ajustar Relato
              </button>

              <button
                type="button"
                onClick={handleConfirmApply}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Incorporar ao RDO</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
