
import CallForPapers from "../components/common/CallForPapers";
import Indexing from "../components/common/Indexing";
import LatestIssues from "../components/common/LatestIssues";
import ResearchAreas from "../components/common/ResearchAreas";
import Hero from "../components/hero";


export default function Home() {
  return (
    <div className="flex w-full flex-col min-h-screen bg-stone-50">
      <Hero/>
      <Indexing/>
      <CallForPapers/>
      <ResearchAreas/>
      <LatestIssues/>
      {/* Future Sections:
        <LatestIssues /> 
      */}
    </div>
  );
}