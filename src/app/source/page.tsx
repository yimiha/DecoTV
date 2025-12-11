/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */

'use client';

import { useEffect, useState } from 'react';

import { ApiSite, getAvailableApiSites } from '@/lib/config';
import { SearchResult } from '@/lib/types';

import PageLayout from '@/components/PageLayout';
import VideoCard from '@/components/VideoCard';

export default function SourcesPage() {
  const [videoSources, setVideoSources] = useState<ApiSite[]>([]);
  const [selectedSource, setSelectedSource] = useState<ApiSite | null>(null);
  const [selectedType, setSelectedType] = useState<string>('热门');
  const [videoList, setVideoList] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [videoTypes, setVideoTypes] = useState<Array<{ key: string; label: string }>>([
    { key: '热门', label: '热门' }
  ]);

  // 获取视频源列表
  useEffect(() => {
    const fetchVideoSources = async () => {
      try {
        const sources = await getAvailableApiSites();
        setVideoSources(sources);
        // 默认选择第一个视频源
        if (sources.length > 0) {
          setSelectedSource(sources[0]);
        }
      } catch (error) {
        console.error('获取视频源失败:', error);
      }
    };

    fetchVideoSources();
  }, []);

  // 当选择视频源或类型变化时，获取视频列表
  useEffect(() => {
    if (!selectedSource) return;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        setVideoList([]);
        
        // 根据选择的类型构建查询
        const query = selectedType === '热门' ? '热门' : selectedType;
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&source=${selectedSource.key}`);
        
        if (response.ok) {
          const data = await response.json();
          const videos = data.results || [];
          setVideoList(videos);
          
          // 从视频数据中提取唯一的影视类型
          if (videos.length > 0) {
            // 提取所有class值
            const classValues = videos
              .filter(video => video.class)
              .map(video => video.class!)
              .filter((value, index, self) => self.indexOf(value) === index);
            
            // 构建类型列表（包含热门 + 所有唯一class值）
            const types = [
              { key: '热门', label: '热门' },
              ...classValues.map(classValue => ({
                key: classValue,
                label: classValue
              }))
            ];
            
            setVideoTypes(types);
          }
        }
      } catch (error) {
        console.error('获取视频列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedSource, selectedType]);

  return (
    <PageLayout>
      <div className='px-2 sm:px-10 py-4 sm:py-8 overflow-visible'>
        {/* 页面标题 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-200'>视频源</h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>选择视频源和影视类型查看相关视频</p>
        </div>

        {/* 影视类型切换 */}
        <div className='mb-8 flex flex-wrap gap-2'>
          {videoTypes.map((type) => (
            <button
              key={type.key}
              className={`px-5 py-2 rounded-full transition-all duration-300 ${selectedType === type.key
                ? 'bg-blue-500 text-white font-medium'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
              onClick={() => setSelectedType(type.key)}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* 视频源列表 */}
        <div className='mb-8'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200 mb-4'>视频源选项</h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
            {videoSources.map((source) => (
              <button
                key={source.key}
                className={`p-4 rounded-xl transition-all duration-300 flex flex-col items-center text-center ${selectedSource?.key === source.key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                onClick={() => setSelectedSource(source)}
              >
                <span className='font-medium'>{source.name}</span>
                {source.detail && (
                  <span className='text-xs mt-1 opacity-80 truncate w-full'>{source.detail}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 视频列表 */}
        {selectedSource && (
          <div>
            <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200 mb-4'>
              {selectedSource.name} - {selectedType}视频
            </h2>

            {loading ? (
              // 加载状态
              <div className='grid grid-cols-3 gap-x-2 gap-y-14 sm:gap-y-20 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fill,_minmax(11rem,_1fr))] sm:gap-x-8'>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className='w-full'>
                    <div className='relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-200 animate-pulse dark:bg-gray-800'>
                      <div className='absolute inset-0 bg-gray-300 dark:bg-gray-700'></div>
                    </div>
                    <div className='mt-2 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-800'></div>
                  </div>
                ))}
              </div>
            ) : videoList.length > 0 ? (
              // 视频列表
              <div className='justify-start grid grid-cols-3 gap-x-2 gap-y-14 sm:gap-y-20 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fill,_minmax(11rem,_1fr))] sm:gap-x-8'>
                {videoList.map((video) => (
                  <div key={video.source + video.id} className='w-full'>
                    <VideoCard
                      query={video.title}
                      id={video.id}
                      source={video.source}
                      title={video.title}
                      year={video.year}
                      poster={video.poster}
                      episodes={video.episodes.length}
                      source_name={video.source_name}
                      from='search'
                      type={video.episodes.length > 1 ? 'tv' : 'movie'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // 无数据
              <div className='text-center text-gray-500 py-16 dark:text-gray-400'>
                <p>暂无视频数据</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
