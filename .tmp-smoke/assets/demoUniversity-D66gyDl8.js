import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//#region src/lib/utils.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
window.self, window.top;
//#endregion
//#region src/lib/demoUniversity.js
var UNIVERSITY = {
	name: "Digital Dean",
	platform: "Academic Intelligence",
	tagline: "Your Academic Journey. One Intelligent Platform.",
	shortName: "DD",
	academicYear: "2026 / 2027",
	semester: "Fall Semester",
	updated: "Updated 7 Nov, 08:40",
	disclaimer: "Digital Dean is a fictional institution. All people, records and metrics shown are synthetic demonstration data."
};
[
	{
		id: "eco",
		code: "ECO",
		name: "Faculty of Economics",
		dean: "Prof. Helena Marsh",
		students: 1240,
		professors: 86,
		gpa: 4.18,
		attendance: 93.1,
		support: 41,
		trend: 2.4
	},
	{
		id: "ir",
		code: "IR",
		name: "Faculty of International Relations",
		dean: "Prof. Daniel Ríos",
		students: 1364,
		professors: 104,
		gpa: 4.02,
		attendance: 90.2,
		support: 58,
		trend: -1.2
	},
	{
		id: "mgt",
		code: "MGT",
		name: "Faculty of Management and Technology",
		dean: "Prof. Aisha Rahman",
		students: 1082,
		professors: 78,
		gpa: 3.94,
		attendance: 87.9,
		support: 66,
		trend: -2.8
	}
].map((faculty) => ({
	name: faculty.code,
	gpa: faculty.gpa,
	attendance: faculty.attendance
}));
//#endregion
export { cn as n, UNIVERSITY as t };
