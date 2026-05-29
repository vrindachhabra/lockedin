import { motion } from "framer-motion";
import { useLockedInStore } from "@/store/useLockedInStore";
import { cn } from "@/lib/utils";

interface BranchPath {
  id: string;
  path: string;
  minStage: number; // 1 = Sprout, 2 = Small Plant, 3 = Growing Tree, 4 = Mature Tree
  strokeWidth: number;
}

const BRANCHES: BranchPath[] = [
  // STAGE 1: Sprout
  { id: "trunk-sprout", path: "M 200 150 Q 198 125 200 105", minStage: 1, strokeWidth: 3 },
  
  // STAGE 2: Small Plant (adds higher trunk and side branches)
  { id: "trunk-extend-small", path: "M 200 105 Q 201 90 198 75", minStage: 2, strokeWidth: 2.5 },
  { id: "small-branch-left", path: "M 199 120 Q 185 112 175 105", minStage: 2, strokeWidth: 2 },
  { id: "small-branch-right", path: "M 200 110 Q 215 102 225 95", minStage: 2, strokeWidth: 2 },
  
  // STAGE 3: Growing Tree (adds more complexity and secondary branches)
  { id: "trunk-extend-growing", path: "M 198 75 Q 197 60 200 45", minStage: 3, strokeWidth: 2 },
  { id: "growing-branch-left-low-sec", path: "M 185 115 Q 172 100 160 97", minStage: 3, strokeWidth: 1.5 },
  { id: "growing-branch-right-low-sec", path: "M 215 107 Q 228 93 238 90", minStage: 3, strokeWidth: 1.5 },
  { id: "growing-branch-left-high", path: "M 199 85 Q 180 72 170 60", minStage: 3, strokeWidth: 1.5 },
  { id: "growing-branch-right-high", path: "M 198 80 Q 220 67 230 55", minStage: 3, strokeWidth: 1.5 },
  
  // STAGE 4: Mature Tree (adds ultimate fullness and extensions)
  { id: "mature-branch-left-low-ext", path: "M 175 105 Q 160 105 145 102", minStage: 4, strokeWidth: 1.5 },
  { id: "mature-branch-right-low-ext", path: "M 225 95 Q 240 95 255 92", minStage: 4, strokeWidth: 1.5 },
  { id: "mature-branch-left-high-ext", path: "M 170 60 Q 155 50 140 45", minStage: 4, strokeWidth: 1.2 },
  { id: "mature-branch-right-high-ext", path: "M 230 55 Q 245 45 260 40", minStage: 4, strokeWidth: 1.2 },
  { id: "mature-top-branch-left", path: "M 200 45 Q 185 30 180 20", minStage: 4, strokeWidth: 1.2 },
  { id: "mature-top-branch-right", path: "M 200 45 Q 215 30 220 20", minStage: 4, strokeWidth: 1.2 }
];

interface LeafData {
  id: string;
  x: number;
  y: number;
  rotate: number; // angle of rotation
  minStage: number; // stage when it appears
}

const LEAVES: LeafData[] = [
  // STAGE 1: Sprout (2 leaves)
  { id: "sprout-leaf-1", x: 200, y: 105, rotate: 25, minStage: 1 },
  { id: "sprout-leaf-2", x: 199, y: 122, rotate: -45, minStage: 1 },
  
  // STAGE 2: Small Plant (5 leaves)
  { id: "small-leaf-1", x: 175, y: 105, rotate: -60, minStage: 2 },
  { id: "small-leaf-2", x: 225, y: 95, rotate: 60, minStage: 2 },
  { id: "small-leaf-3", x: 198, y: 75, rotate: -15, minStage: 2 },
  
  // STAGE 3: Growing Tree (12 leaves total)
  { id: "growing-leaf-1", x: 160, y: 97, rotate: -70, minStage: 3 },
  { id: "growing-leaf-2", x: 238, y: 90, rotate: 70, minStage: 3 },
  { id: "growing-leaf-3", x: 170, y: 60, rotate: -45, minStage: 3 },
  { id: "growing-leaf-4", x: 230, y: 55, rotate: 45, minStage: 3 },
  { id: "growing-leaf-5", x: 200, y: 45, rotate: 10, minStage: 3 },
  { id: "growing-leaf-6", x: 188, y: 95, rotate: -30, minStage: 3 },
  { id: "growing-leaf-7", x: 212, y: 90, rotate: 30, minStage: 3 },
  
  // STAGE 4: Mature Tree (full canopy - adds 10+ leaves)
  { id: "mature-leaf-1", x: 145, y: 102, rotate: -90, minStage: 4 },
  { id: "mature-leaf-2", x: 255, y: 92, rotate: 90, minStage: 4 },
  { id: "mature-leaf-3", x: 140, y: 45, rotate: -60, minStage: 4 },
  { id: "mature-leaf-4", x: 260, y: 40, rotate: 60, minStage: 4 },
  { id: "mature-leaf-5", x: 180, y: 20, rotate: -30, minStage: 4 },
  { id: "mature-leaf-6", x: 220, y: 20, rotate: 30, minStage: 4 },
  { id: "mature-leaf-7", x: 160, y: 52, rotate: -40, minStage: 4 },
  { id: "mature-leaf-8", x: 240, y: 48, rotate: 40, minStage: 4 },
  { id: "mature-leaf-9", x: 190, y: 32, rotate: -15, minStage: 4 },
  { id: "mature-leaf-10", x: 210, y: 32, rotate: 15, minStage: 4 }
];

const FLOWERS = [
  { id: "flower-1", x: 180, y: 20 },
  { id: "flower-2", x: 220, y: 20 },
  { id: "flower-3", x: 140, y: 45 },
  { id: "flower-4", x: 260, y: 40 },
  { id: "flower-5", x: 160, y: 97 },
  { id: "flower-6", x: 238, y: 90 }
];

export function PlacementGrowthTree() {
  const placements = useLockedInStore((state) => state.placements);
  
  const totalApplications = placements.length;
  const offersCount = placements.filter((p) => p.status === "offer").length;
  const isBlooming = offersCount > 0;

  // Growth logic milestones:
  // 0 -> Seed
  // 1-4 -> Sprout
  // 5-14 -> Small Plant
  // 15-29 -> Growing Tree
  // 30+ -> Mature Tree
  let stageIndex = 0;
  let stageName = "Seed";
  let progressText = "";
  let progressPercentage = 0;

  if (totalApplications === 0) {
    stageIndex = 0;
    stageName = "Seed";
    progressText = "0 / 1 Applications to Sprout";
    progressPercentage = 0;
  } else if (totalApplications <= 4) {
    stageIndex = 1;
    stageName = "Sprout";
    progressText = `${totalApplications} / 5 Applications to Small Plant`;
    progressPercentage = (totalApplications / 5) * 100;
  } else if (totalApplications <= 14) {
    stageIndex = 2;
    stageName = "Small Plant";
    progressText = `${totalApplications} / 15 Applications to Growing Tree`;
    progressPercentage = ((totalApplications - 4) / 11) * 100;
  } else if (totalApplications <= 29) {
    stageIndex = 3;
    stageName = "Growing Tree";
    progressText = `${totalApplications} / 30 Applications to Mature Tree`;
    progressPercentage = ((totalApplications - 14) / 16) * 100;
  } else {
    stageIndex = 4;
    stageName = "Mature Tree";
    progressText = `${totalApplications} Applications (Mature Tree reached)`;
    progressPercentage = 100;
  }

  // Adjust display label for blooming state
  const displayStageName = isBlooming ? "Blooming Tree" : stageName;

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 relative select-none bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5">
      {/* Decorative Grid Lines to fit modern SaaS aesthetic */}
      <div className="absolute inset-0 surface-line opacity-25 pointer-events-none rounded-2xl" />

      {/* SVG Canvas Container */}
      <div className="flex-1 w-full flex items-center justify-center min-h-[110px] relative z-10">
        <svg 
          viewBox="100 10 200 150" 
          className="w-full h-full max-h-[135px] max-w-[280px]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Ambient Ground Arc */}
          <path
            d="M 120 150 Q 200 147 280 150"
            className="stroke-white/10"
            strokeWidth={1}
            fill="none"
          />

          {stageIndex === 0 && (
            <motion.g
              key="seed-stage"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              {/* Seed Mound */}
              <path
                d="M 190 150 Q 200 145 210 150"
                className="stroke-primary/30 fill-primary/10"
                strokeWidth={1.5}
              />
              {/* Seed Shell */}
              <motion.path
                d="M 200 148 C 197 148 196 145 200 140 C 204 145 203 148 200 148 Z"
                className="fill-primary"
                style={{ filter: "drop-shadow(0 0 6px rgba(82, 190, 255, 0.8))" }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Seed Glowing Pulse Ring */}
              <motion.circle
                cx={200}
                cy={144}
                r={6}
                fill="none"
                className="stroke-primary/45"
                strokeWidth={0.75}
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.8, 0]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </motion.g>
          )}

          {/* Render Branches according to current Growth Stage */}
          {stageIndex > 0 &&
            BRANCHES.filter((b) => stageIndex >= b.minStage).map((b) => (
              <motion.path
                key={b.id}
                d={b.path}
                className={cn(
                  "stroke-sky-200/90 transition-all duration-300",
                  isBlooming ? "stroke-emerald-400/80" : "stroke-sky-200/80"
                )}
                strokeWidth={b.strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  filter: isBlooming 
                    ? "drop-shadow(0 0 2px rgba(52, 211, 153, 0.2))" 
                    : "drop-shadow(0 0 2px rgba(186, 230, 253, 0.15))"
                }}
              />
            ))}

          {/* Render Leaves according to current Growth Stage */}
          {stageIndex > 0 &&
            LEAVES.filter((l) => stageIndex >= l.minStage).map((l, index) => (
              <motion.g
                key={l.id}
                transform={`translate(${l.x}, ${l.y}) rotate(${l.rotate})`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                  delay: 0.3 + index * 0.05
                }}
              >
                {/* Secondary swaying group for organic wind motion */}
                <motion.g
                  animate={{
                    rotate: [0, -4, 4, 0],
                    y: [0, -0.7, 0.7, 0]
                  }}
                  transition={{
                    duration: 4.5 + (index % 3) * 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                >
                  <path
                    d="M 0 0 C -3 -5 -5 -5 -5 -9 C -5 -12 -3 -14 0 -16 C 3 -14 5 -12 5 -9 C 5 -5 3 -5 0 0 Z"
                    className={cn(
                      "transition-colors duration-500 stroke-emerald-500/30",
                      isBlooming 
                        ? "fill-emerald-400/90 stroke-emerald-300/40" 
                        : "fill-primary/75 stroke-primary-foreground/20"
                    )}
                    style={{
                      filter: isBlooming 
                        ? "drop-shadow(0 0 5px rgba(52, 211, 153, 0.5))" 
                        : "drop-shadow(0 0 4px rgba(82, 190, 255, 0.35))"
                    }}
                    strokeWidth={0.5}
                  />
                </motion.g>
              </motion.g>
            ))}

          {/* Render Pulsing Flowers/Blossoms ONLY in Blooming State */}
          {stageIndex > 0 && isBlooming &&
            FLOWERS.slice(0, Math.min(FLOWERS.length, stageIndex * 2)).map((f, index) => (
              <motion.g
                key={f.id}
                transform={`translate(${f.x}, ${f.y})`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 110,
                  damping: 10,
                  delay: 0.6 + index * 0.1
                }}
              >
                {/* Soft pulse animation loop */}
                <motion.g
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.85, 1, 0.85]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.4
                  }}
                >
                  {/* Glowing Flower Aura */}
                  <circle r={5} className="fill-accent/20 blur-[1.5px]" />
                  {/* Mini Petals */}
                  <circle cx={0} cy={-2.2} r={2.0} className="fill-accent" />
                  <circle cx={2.2} cy={-0.7} r={2.0} className="fill-accent" />
                  <circle cx={1.4} cy={2.0} r={2.0} className="fill-accent" />
                  <circle cx={-1.4} cy={2.0} r={2.0} className="fill-accent" />
                  <circle cx={-2.2} cy={-0.7} r={2.0} className="fill-accent" />
                  {/* Golden Center */}
                  <circle cx={0} cy={0} r={1.0} className="fill-amber-300" />
                </motion.g>
              </motion.g>
            ))}
        </svg>
      </div>

      {/* Label and Progress Subtext at bottom */}
      <div className="w-full flex flex-col items-center justify-end z-10 mt-1">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <span>Growth Stage:</span>
          <span 
            className={cn(
              "font-extrabold tracking-wide transition-colors duration-500",
              isBlooming ? "text-accent drop-shadow-[0_0_8px_rgba(154,76,52,0.4)]" : "text-primary"
            )}
          >
            {displayStageName}
          </span>
        </div>
        <div className="text-xs text-muted-foreground/80 mt-1 font-medium text-center max-w-[90%] truncate">
          This tree visualizes your placement journey based on applications and offers.
        </div>

        {/* Sleek Progress Bar matches existing dashboard accents */}
        <div className="w-40 h-1 bg-white/5 rounded-full mt-2 overflow-hidden border border-white/5">
          <motion.div 
            className={cn(
              "h-full rounded-full transition-colors duration-500",
              isBlooming ? "bg-accent" : "bg-primary"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
