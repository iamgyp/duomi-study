'use client';

import { useState } from 'react';
import { CheckCircle, Clock, X } from 'lucide-react';
import { saveRecord } from '@/lib/study-storage';
import { StudyRecord, Subject, ContentType } from '@/types/study-record';
import { useTranslation } from '@/hooks/useTranslation';

interface StudyRecordButtonProps {
  subject: Subject;
  contentType: ContentType;
  contentTitle: string;
  duration?: number;
  onRecord?: (record: StudyRecord) => void;
}

export function StudyRecordButton({
  subject,
  contentType,
  contentTitle,
  duration = 15,
  onRecord,
}: StudyRecordButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [studyDuration, setStudyDuration] = useState(duration);
  const [isRecording, setIsRecording] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useTranslation();

  const handleRecord = () => {
    setIsRecording(true);
    
    const record = saveRecord({
      subject,
      contentType,
      contentTitle,
      duration: studyDuration,
      completedAt: new Date().toISOString(),
    });
    
    setIsRecording(false);
    setShowSuccess(true);
    
    if (onRecord) {
      onRecord(record);
    }
    
    setTimeout(() => {
      setShowSuccess(false);
      setShowModal(false);
    }, 1500);
  };

  const durationOptions = [5, 10, 15, 20, 30, 45, 60];

  return (
    <>
      {/* ?????? */}
      <button
        onClick={() => setShowModal(true)}
        className="mc-btn bg-[#4CAF50] text-white text-sm sm:text-base hover:bg-[#45a049] flex items-center justify-center gap-2 py-2 px-4"
      >
        <CheckCircle className="h-4 w-4" />
        {t('StudyRecordButton.label')}
      </button>

      {/* ???? */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* ???? */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModal(false)}
          />

          {/* ???? */}
          <div className="relative bg-[#C6C6C6] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] w-full max-w-md p-6">
            {/* ???? */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 p-2 hover:bg-black/10 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {showSuccess ? (
              // ????
              <div className="text-center py-8">
                <div className="text-6xl mb-4">??</div>
                <h3 className="text-2xl font-bold text-[#333] mb-2">{t('StudyRecordButton.success')}</h3>
                <p className="text-gray-600">{t('StudyRecordButton.success')}</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#333] mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('StudyRecordButton.title')}
                </h3>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">{t('StudyRecordButton.subjectLabel')}: {contentTitle}</p>
                  <label className="block text-sm font-bold text-[#333] mb-2">
                    {t('StudyRecordButton.durationLabel')}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {durationOptions.map((min) => (
                      <button
                        key={min}
                        onClick={() => setStudyDuration(min)}
                        className={`py-2 px-3 text-sm font-bold border-2 border-black transition-all active:translate-y-1 ${
                          studyDuration === min
                            ? 'bg-[#4CAF50] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {min} {t('StudyStats.minutes')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 mc-btn bg-gray-400 text-white py-3 hover:bg-gray-500"
                  >
                    {t('StudyRecordButton.cancel')}
                  </button>
                  <button
                    onClick={handleRecord}
                    disabled={isRecording}
                    className="flex-1 mc-btn bg-[#4CAF50] text-white py-3 hover:bg-[#45a049] disabled:opacity-50"
                  >
                    {isRecording ? t('StudyRecordButton.submit') : t('StudyRecordButton.submit')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
