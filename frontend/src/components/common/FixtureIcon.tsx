import { FixtureTypeText } from "../../constants/FixtureType";
import { RigStatusText } from "../../constants/RigStatus";
import type { Fixture } from "../../types/Fixture";
import type { FixtureType } from "../../types/FixtureType";
import type { RigStatus } from "../../types/RigStatus";
import { StatusBadge } from "./StatusBadge";

export function FixtureIcon({ fixture }: { fixture: Fixture }) {
  return (
    <div className={"fixture-icon " + fixture.rig_status.toLowerCase()}>
      <strong>{fixture.fixture_code}</strong>
      <span className="fixture-type">
        {FixtureTypeText[fixture.fixture_type as FixtureType] ?? fixture.fixture_type}
      </span>
      <StatusBadge
        value={fixture.rig_status}
        text={RigStatusText[fixture.rig_status as RigStatus] ?? fixture.rig_status}
      />
    </div>
  );
}
