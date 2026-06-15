import { useRef, useState } from 'react';
import { usePodcastStore } from '../store/usePodcastStore';
import { DarkPodcast } from './templates/DarkPodcast';
import { KnowledgeNote } from './templates/KnowledgeNote';
import { RetroTape } from './templates/RetroTape';
import { MinimalTimeline } from './templates/MinimalTimeline';
import { exportMultipleAsImages, templateNames, getExportDimensions } from '../utils/exportImage';
import { TemplateType } from '../types';
import { ArrowLeft, Download, Loader2, Layers } from 'lucide-react';

const templates: TemplateType[] = ['dark', 'note', 'retro', 'minimal'];

export function ComparePanel() {
  const { podcast, chapters, size, setCompareMode, setTemplate } = usePodcastStore();
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const exportCardRefs = useRef<Record<TemplateType, HTMLDivElement | null>>({
    dark: null,
    note: null,
    retro: null,
    minimal: null,
  });

  const dims = getExportDimensions(size);
  const scale = size === 'portrait' ? 0.35 : 0.4;

  const renderTemplate = (template: TemplateType) => {
    const props = { podcast, chapters, size };
    switch (template) {
      case 'dark':
        return <DarkPodcast {...props} />;
      case 'note':
        return <KnowledgeNote {...props} />;
      case 'retro':
        return <RetroTape {...props} />;
      case 'minimal':
        return <MinimalTimeline {...props} />;
      default:
        return <DarkPodcast {...props} />;
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    setExportProgress(0);
    try {
      const baseName = podcast.name
        ? `${podcast.name}-${podcast.episode || 'card'}`.replace(/\s+/g, '-')
        : 'podcast-card';

      const elements = templates
        .map((t) => {
          const el = exportCardRefs.current[t];
          if (!el) return null;
          return {
            element: el,
            filename: `${baseName}-${templateNames[t]}`,
          };
        })
        .filter(
          (item): item is { element: HTMLElement; filename: string } => item !== null
        );

      await exportMultipleAsImages(elements, size, (current, total) => {
        setExportProgress(Math.round((current / total) * 100));
      });
    } catch (error) {
      console.error('批量导出失败:', error);
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const handleBackToSingle = () => {
    setCompareMode(false);
  };

  const handleSelectTemplate = (template: TemplateType) => {
    setTemplate(template);
    setCompareMode(false);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-zinc-900/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToSingle}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            title="返回单模板预览"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Layers className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-white">模板对比</h2>
        </div>
        <span className="text-xs text-zinc-500">共 4 套模板</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 p-2">
          {templates.map((template) => (
            <div key={template} className="flex flex-col items-center">
              <div className="text-sm text-zinc-400 mb-2">{templateNames[template]}</div>
              <div
                className="relative cursor-pointer group rounded-xl overflow-hidden shadow-lg"
                onClick={() => handleSelectTemplate(template)}
                style={{
                  width: dims.width * scale,
                  height: dims.height * scale,
                }}
              >
                <div
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: dims.width,
                    height: dims.height,
                  }}
                >
                  {renderTemplate(template)}
                </div>
                <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-sm font-medium bg-zinc-900/80 px-3 py-1 rounded-full">
                    点击使用
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        {templates.map((template) => (
          <div
            key={template}
            ref={(el) => {
              exportCardRefs.current[template] = el;
            }}
            className="rounded-2xl overflow-hidden"
          >
            {renderTemplate(template)}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={handleExportAll}
          disabled={exporting}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] hover:bg-[position:100%_0] text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              批量导出中... {exportProgress}%
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              一键导出全部模板
            </>
          )}
        </button>
        <p className="text-xs text-zinc-500 text-center">
          将导出 4 张图片，分别对应 4 套模板风格
        </p>
      </div>
    </div>
  );
}
