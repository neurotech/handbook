import { format, isValid } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

function parsePublicationDate(value: string | null | undefined): Date | null {
	if (!value) return null;
	const d = new Date(value);
	return isValid(d) ? d : null;
}

export function formatPubDateFull(
	value: string | null | undefined,
): string | null {
	const d = parsePublicationDate(value);
	return d ? format(d, "EEEE MMMM do, yyyy", { locale: enUS }) : null;
}

export function formatPubDateCompact(
	value: string | null | undefined,
): string | null {
	const d = parsePublicationDate(value);
	return d ? format(d, "MMMM d", { locale: enUS }) : null;
}
