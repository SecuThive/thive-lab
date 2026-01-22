"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectCard, { type Project } from "./ProjectCard";

type ProjectCarouselProps = {
  projects: Project[];
};

export default function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 4; // 한 페이지에 4개씩 표시
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const itemWidth = container.scrollWidth / totalPages;
      container.scrollTo({
        left: itemWidth * currentPage,
        behavior: "smooth",
      });
    }
  }, [currentPage, totalPages]);

  // 프로젝트가 4개 이하면 캐러셀 없이 그리드로만 표시
  if (projects.length <= itemsPerPage) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:auto-rows-[270px] sm:grid-cols-6 sm:grid-flow-dense">
        {projects.map((project) => (
          <ProjectCard
            key={project.name}
            project={project}
            className={project.layout ?? "sm:col-span-3"}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:bg-zinc-900/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:bg-zinc-900/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Page Indicators */}
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentPage
                  ? "w-8 bg-indigo-500"
                  : "w-2 bg-zinc-700 hover:bg-zinc-600"
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className={`overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            width: `${totalPages * 100}%`,
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="grid flex-shrink-0 grid-cols-1 gap-5 sm:auto-rows-[270px] sm:grid-cols-6 sm:grid-flow-dense"
              style={{ width: `${100 / totalPages}%` }}
            >
              {projects
                .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                .map((project) => (
                  <ProjectCard
                    key={project.name}
                    project={project}
                    className={project.layout ?? "sm:col-span-3"}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Page Counter */}
      <div className="mt-6 text-center text-sm text-zinc-500">
        Page {currentPage + 1} of {totalPages}
      </div>
    </div>
  );
}
